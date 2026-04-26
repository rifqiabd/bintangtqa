export const subjectOptions = [
  { value: "matematika", label: "Matematika" },
  { value: "fisika", label: "Fisika" },
  { value: "kimia", label: "Kimia" },
  { value: "biologi", label: "Biologi" },
  { value: "bahasa_indonesia", label: "Bahasa Indonesia" },
  { value: "bahasa_inggris", label: "Bahasa Inggris" },
  { value: "ekonomi", label: "Ekonomi" },
  { value: "akuntansi", label: "Akuntansi" },
  { value: "sejarah", label: "Sejarah" },
  { value: "geografi", label: "Geografi" },
  { value: "sosiologi", label: "Sosiologi" },
  { value: "pkn", label: "PKN" },
];

export const formatSubjectLabel = (value: string): string => {
  return value.replace(/_/g, " ");
};