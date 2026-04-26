import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { useDebounce } from "@/hooks/use-debounce";

interface School {
  npsn: string;
  nama: string;
  bentukPendidikan?: string;
  alamat?: {
    nama_kabupaten?: string;
    nama_provinsi?: string;
  };
}

interface SchoolPickerProps {
  value?: string;
  onChange?: (schoolName: string) => void;
  className?: string;
}

export function SchoolPicker({ value, onChange, className }: SchoolPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) {
      setSchools([]);
      return;
    }

    const fetchSchools = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://xkupzhwboluapizzstwc.supabase.co/functions/v1/fetch-schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nama: debouncedSearch,
            limit: 20,
          }),
        });

        if (!res.ok) {
          throw new Error(`Error fetching schools: ${res.statusText}`);
        }

        const data = await res.json();

        if (data && data.success && data.data) {
          setSchools(data.data);
        } else {
          setSchools([]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          {value || "Cari sekolah..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Ketik nama sekolah..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Mencari...</span>
                </div>
              ) : search.length < 3 ? (
                "Ketik minimal 3 karakter untuk mencari"
              ) : (
                "Sekolah tidak ditemukan"
              )}
            </CommandEmpty>
            <CommandGroup>
              {schools.map((school) => (
                <CommandItem
                  key={school.npsn}
                  value={school.nama}
                  onSelect={(currentValue) => {
                    onChange?.(school.nama);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === school.nama ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{school.nama}</span>
                    {(school.bentukPendidikan || school.alamat?.nama_kabupaten) && (
                      <span className="text-xs text-muted-foreground">
                        {[school.bentukPendidikan, school.alamat?.nama_kabupaten, school.alamat?.nama_provinsi]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
