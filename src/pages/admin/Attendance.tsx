import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download, Search, Users, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AttendanceRecord {
  id: string;
  tutor_id: string;
  student_id: string | null;
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
  tutor: {
    full_name: string;
  } | null;
  student: {
    full_name: string;
  } | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTutor, setFilterTutor] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [tutors, setTutors] = useState<{ id: string; full_name: string }[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  useEffect(() => {
    loadAttendance();
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      const { data: tutorUsers, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");

      if (error) throw error;

      if (!tutorUsers || tutorUsers.length === 0) return;

      const tutorIds = tutorUsers.map((t) => t.user_id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", tutorIds);

      if (profileError) throw profileError;
      setTutors(data || []);
    } catch (error) {
      console.error("Error loading tutors:", error);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          tutor_id,
          student_id,
          check_in_time,
          check_out_time,
          notes,
          tutor:profiles!attendance_tutor_id_fkey(
            full_name
          ),
          student:profiles!attendance_student_id_fkey(
            full_name
          )
        `)
        .order("check_in_time", { ascending: false })
        .limit(5000);

      if (error) throw error;

      const enrichedData = (data || []).map((item: any) => ({
        ...item,
        tutor: item.tutor?.[0] || null,
        student: item.student?.[0] || null,
      }));

      setAttendance(enrichedData);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Gagal memuat data absensi");
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.tutor?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.student?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTutor =
      filterTutor === "all" || record.tutor_id === filterTutor;

    const matchesDate =
      !filterMonth ||
      record.check_in_time.startsWith(filterMonth);

    return matchesSearch && matchesTutor && matchesDate;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (
    checkIn: string,
    checkOut: string | null
  ) => {
    if (!checkOut) return "-";
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    const minutes = Math.floor(((end - start) / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

  const getChartDataByTutor = () => {
    const tutorCount: Record<string, number> = {};
    filteredAttendance.forEach((record) => {
      const tutorName = record.tutor?.full_name || "Unknown";
      tutorCount[tutorName] = (tutorCount[tutorName] || 0) + 1;
    });
    return Object.entries(tutorCount).map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      fullName: name,
      value,
    }));
  };

  const getChartDataByDate = () => {
    const dateCount: Record<string, number> = {};
    filteredAttendance.forEach((record) => {
      const date = record.check_in_time.split("T")[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    return Object.entries(dateCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        value,
      }));
  };

  const getStatusData = () => {
    const statusCount = {
      checkedIn: filteredAttendance.filter((a) => !a.check_out_time).length,
      completed: filteredAttendance.filter((a) => a.check_out_time).length,
    };
    return [
      { name: "Check In", value: statusCount.checkedIn },
      { name: "Selesai", value: statusCount.completed },
    ];
  };

  const exportToCSV = () => {
    const headers = [
      "No",
      "Tutor",
      "Siswa",
      "Check In",
      "Check Out",
      "Durasi",
      "Notes",
    ];
    const rows = filteredAttendance.map((record, index) => [
      index + 1,
      record.tutor?.full_name || "-",
      record.student?.full_name || "-",
      formatDate(record.check_in_time) + " " + formatTime(record.check_in_time),
      record.check_out_time
        ? formatDate(record.check_out_time) +
          " " +
          formatTime(record.check_out_time)
        : "-",
      getDuration(record.check_in_time, record.check_out_time),
      record.notes || "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `absensi_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diexport");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Laporan Absensi</h1>
        <p className="text-muted-foreground">
          Lihat dan analisis laporan absensi semua tutor
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAttendance.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAttendance.filter((a) => a.check_out_time).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAttendance.filter((a) => !a.check_out_time).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tutor Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredAttendance.map((a) => a.tutor_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <CardTitle>Riwayat Absensi</CardTitle>
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full lg:w-48"
                />
              </div>
              <Select value={filterTutor} onValueChange={setFilterTutor}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Semua Tutor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tutor</SelectItem>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full lg:w-40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterTutor("all");
                  setFilterMonth("");
                }}
              >
                Reset
              </Button>
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "table" | "chart")}
              >
                <TabsList>
                  <TabsTrigger value="table">Tabel</TabsTrigger>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            filteredAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Data</h3>
                <p className="text-muted-foreground text-center">
                  Tidak ada data absensi yang sesuai dengan filter
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{record.tutor?.full_name || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>
                            {record.student?.full_name || "Tanpa Siswa"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{formatDate(record.check_in_time)}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatTime(record.check_in_time)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.check_out_time ? (
                            <div>
                              <div>{formatDate(record.check_out_time)}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatTime(record.check_out_time)}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">Belum Check Out</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.check_out_time ? "default" : "secondary"
                            }
                          >
                            {getDuration(
                              record.check_in_time,
                              record.check_out_time
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-2 text-sm">
                            {record.notes || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Absensi per Tutor
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartDataByTutor()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="start"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Status Absensi
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getStatusData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Tren Absensi (7 Hari Terakhir)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartDataByDate()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#0088FE"
                        name="Jumlah Sesi"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance;