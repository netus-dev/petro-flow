import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TimesheetRequest,
  TimesheetStats,
  ApprovalStatus,
} from "../../domain/entities";
import { MockTimesheetRepository } from "../../infrastructure/repository";
import {
  GetTimesheetListUseCase,
  GetTimesheetStatsUseCase,
  SaveTimesheetUseCase,
  UpdateTimesheetStatusUseCase,
  GetTimesheetByIdUseCase,
} from "../../application/use-cases";

export type TimesheetView = "dashboard" | "list" | "detail" | "create";
export type UserRole = "Técnico" | "Supervisor" | "Gerente";

export function useTimesheet() {
  const [view, setView] = useState<TimesheetView>("dashboard");
  const [role, setRole] = useState<UserRole>("Supervisor"); // Mock role for now
  const [userId] = useState("USR-103"); // Mock user ID for Supervisor

  const [requests, setRequests] = useState<TimesheetRequest[]>([]);
  const [stats, setStats] = useState<TimesheetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<TimesheetRequest | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRig, setFilterRig] = useState<string>("all");

  const repository = useMemo(() => new MockTimesheetRepository(), []);

  const getListUseCase = useMemo(
    () => new GetTimesheetListUseCase(repository),
    [repository],
  );
  const getStatsUseCase = useMemo(
    () => new GetTimesheetStatsUseCase(repository),
    [repository],
  );
  const getByIdUseCase = useMemo(
    () => new GetTimesheetByIdUseCase(repository),
    [repository],
  );
  const saveUseCase = useMemo(
    () => new SaveTimesheetUseCase(repository),
    [repository],
  );
  const updateStatusUseCase = useMemo(
    () => new UpdateTimesheetStatusUseCase(repository),
    [repository],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        getListUseCase.execute(role, userId),
        getStatsUseCase.execute(role, userId),
      ]);
      setRequests(listData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    } finally {
      setLoading(false);
    }
  }, [getListUseCase, getStatsUseCase, role, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.workerName.toLowerCase().includes(search.toLowerCase()) ||
        r.folio.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchRig = filterRig === "all" || r.rig === filterRig;
      return matchSearch && matchStatus && matchRig;
    });
  }, [requests, search, filterStatus, filterRig]);

  const handleSave = async (timesheet: TimesheetRequest) => {
    await saveUseCase.execute(timesheet);
    await fetchData();
    setView("list");
  };

  const handleUpdateStatus = async (
    id: string,
    status: ApprovalStatus,
    comment: string,
  ) => {
    await updateStatusUseCase.execute(id, status, role, comment);
    await fetchData();
    if (selectedRequest?.id === id) {
      const updated = await getByIdUseCase.execute(id);
      if (updated) setSelectedRequest(updated);
    }
  };

  const navigateToDetail = (request: TimesheetRequest) => {
    setSelectedRequest(request);
    setView("detail");
  };

  return {
    view,
    setView,
    role,
    setRole,
    userId,
    requests,
    filteredRequests,
    selectedRequest,
    setSelectedRequest,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterRig,
    setFilterRig,
    stats,
    loading,
    handleSave,
    handleUpdateStatus,
    navigateToDetail,
    refresh: fetchData,
  };
}
