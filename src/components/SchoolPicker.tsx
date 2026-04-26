import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, School } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface AlamatDetail {
  jalan?: string;
  rt?: string;
  rw?: string;
  nama_desa?: string;
  nama_kecamatan?: string;
  nama_kabupaten?: string;
  nama_provinsi?: string;
}

interface SchoolData {
  nama: string;
  npsn: string;
  alamat: string | AlamatDetail;
  bentuk_pendidikan: string;
}

interface SchoolPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function SchoolPicker({ value, onChange, placeholder = "Cari nama sekolah..." }: SchoolPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [search, setSearch] = useState("");

  const searchSchools = useCallback(async (query: string) => {
    if (query.length < 3) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-schools", {
        method: "POST",
        body: {
          nama: query,
          limit: 20
        }
      });

      if (error) throw error;

      // DevAPI usually returns the array directly or inside a data property
      const results = Array.isArray(data) ? data : (data?.data || []);
      setSchools(results);
    } catch (error) {
      console.error("Error searching schools:", error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) searchSchools(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchSchools]);

  const formatAlamat = (alamat: string | AlamatDetail) => {
    if (typeof alamat === "string") return alamat;
    if (!alamat) return "-";
    
    const parts = [
      alamat.jalan,
      alamat.nama_desa,
      alamat.nama_kecamatan,
      alamat.nama_kabupaten
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal text-left h-auto py-2"
          >
            <div className="flex items-center gap-2 truncate">
              <School className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">
                {value || placeholder}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Ketik minimal 3 karakter..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Mencari...</span>
                </div>
              )}
              {!loading && schools.length === 0 && search.length >= 3 && (
                <CommandEmpty>Sekolah tidak ditemukan.</CommandEmpty>
              )}
              {!loading && search.length < 3 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Masukkan minimal 3 karakter untuk mencari
                </div>
              )}
              <CommandGroup>
                {schools.map((school) => (
                  <CommandItem
                    key={school.npsn}
                    value={school.nama}
                    onSelect={() => {
                      onChange?.(school.nama);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start py-2"
                  >
                    <div className="font-medium text-sm">{school.nama}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                      {school.bentuk_pendidikan} • {formatAlamat(school.alamat)}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SchoolPicker;
