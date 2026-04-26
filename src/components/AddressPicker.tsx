import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Loader2 } from "lucide-react";

const KONOLAND_API = "https://konoland-api.vercel.app";

interface Province {
  code: string;
  province: string;
}

interface Regency {
  code: string;
  regency: string;
  province_code: string;
}

interface District {
  code: string;
  district: string;
  regency_code: string;
}

interface Village {
  code: string;
  village: string;
  district_code: string;
  postal_code: string;
}

interface AddressPickerProps {
  value?: {
    province_code?: string;
    regency_code?: string;
    district_code?: string;
    village_code?: string;
    address?: string;
  };
  onChange?: (value: AddressPickerProps["value"]) => void;
}

export function AddressPicker({ value, onChange }: AddressPickerProps) {
  const [step, setStep] = useState<"province" | "regency" | "district" | "village">("province");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedRegency, setSelectedRegency] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  
  const [address, setAddress] = useState(value?.address || "");

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Handle initial value
  useEffect(() => {
    if (value?.province_code) {
      setSelectedProvince(value.province_code);
      if (value?.regency_code) {
        setSelectedRegency(value.regency_code);
        loadRegencies(value.province_code);
        if (value?.district_code) {
          setSelectedDistrict(value.district_code);
          loadDistricts(value.regency_code);
          if (value?.village_code) {
            setSelectedVillage(value.village_code);
            loadVillages(value.district_code);
          }
        }
      }
    }
  }, [value]);

  const loadProvinces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${KONOLAND_API}/province?limit=40`);
      const data = await res.json();
      setProvinces(data.data || []);
    } catch (error) {
      console.error("Error loading provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegencies = async (provinceCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${KONOLAND_API}/regency?provinceCode=${provinceCode}&limit=600`);
      const data = await res.json();
      setRegencies(data.data || []);
    } catch (error) {
      console.error("Error loading regencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (regencyCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${KONOLAND_API}/district?regencyCode=${regencyCode}&limit=8000`);
      const data = await res.json();
      setDistricts(data.data || []);
    } catch (error) {
      console.error("Error loading districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVillages = async (districtCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${KONOLAND_API}/village?districtCode=${districtCode}&limit=10000`);
      const data = await res.json();
      setVillages(data.data || []);
    } catch (error) {
      console.error("Error loading villages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (val: string) => {
    setSelectedProvince(val);
    setSelectedRegency("");
    setSelectedDistrict("");
    setSelectedVillage("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    
    if (val) {
      loadRegencies(val);
    }
    
    onChange?.({
      province_code: val,
      regency_code: undefined,
      district_code: undefined,
      village_code: undefined,
      address: address,
    });
  };

  const handleRegencyChange = (val: string) => {
    setSelectedRegency(val);
    setSelectedDistrict("");
    setSelectedVillage("");
    setDistricts([]);
    setVillages([]);
    
    if (val) {
      loadDistricts(val);
    }
    
    onChange?.({
      province_code: selectedProvince,
      regency_code: val,
      district_code: undefined,
      village_code: undefined,
      address: address,
    });
  };

  const handleDistrictChange = (val: string) => {
    setSelectedDistrict(val);
    setSelectedVillage("");
    setVillages([]);
    
    if (val) {
      loadVillages(val);
    }
    
    onChange?.({
      province_code: selectedProvince,
      regency_code: selectedRegency,
      district_code: val,
      village_code: undefined,
      address: address,
    });
  };

  const handleVillageChange = (val: string) => {
    setSelectedVillage(val);
    
    const village = villages.find(v => v.code === val);
    
    onChange?.({
      province_code: selectedProvince,
      regency_code: selectedRegency,
      district_code: selectedDistrict,
      village_code: val,
      address: address,
    });
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    onChange?.({
      province_code: selectedProvince,
      regency_code: selectedRegency,
      district_code: selectedDistrict,
      village_code: selectedVillage,
      address: val,
    });
  };

  const selectedProvinceName = provinces.find(p => p.code === selectedProvince)?.province || "";
  const selectedRegencyName = regencies.find(r => r.code === selectedRegency)?.regency || "";
  const selectedDistrictName = districts.find(d => d.code === selectedDistrict)?.district || "";
  const selectedVillageName = villages.find(v => v.code === selectedVillage)?.village || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Pilih Wilayah</span>
      </div>

      {/* Province */}
      <div className="space-y-2">
        <label className="text-sm">Provinsi</label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {province.province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Regency - show when province selected */}
      {selectedProvince && (
        <div className="space-y-2">
          <label className="text-sm">Kabupaten/Kota</label>
          <Select value={selectedRegency} onValueChange={handleRegencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              {regencies.map((regency) => (
                <SelectItem key={regency.code} value={regency.code}>
                  {regency.regency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* District - show when regency selected */}
      {selectedRegency && (
        <div className="space-y-2">
          <label className="text-sm">Kecamatan</label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Village - show when district selected */}
      {selectedDistrict && (
        <div className="space-y-2">
          <label className="text-sm">Desa/Kelurahan</label>
          <Select value={selectedVillage} onValueChange={handleVillageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Desa/Kelurahan" />
            </SelectTrigger>
            <SelectContent>
              {villages.map((village) => (
                <SelectItem key={village.code} value={village.code}>
                  {village.village} {village.postal_code && `(${village.postal_code})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Address Detail */}
      {(selectedProvince || selectedRegency || selectedDistrict || selectedVillage) && (
        <div className="space-y-2">
          <label className="text-sm">Alamat Lengkap (Opsional)</label>
          <Input
            placeholder={
              [
                selectedProvinceName,
                selectedRegencyName,
                selectedDistrictName,
                selectedVillageName,
              ].filter(Boolean).join(", ") || "Nama jalan, RT/RW, dll"
            }
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Memuat...</span>
        </div>
      )}
    </div>
  );
}

export default AddressPicker;