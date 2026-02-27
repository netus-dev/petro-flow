"use client";

import { useState } from "react";
import {
  Clock,
  User,
  LayoutDashboard,
  List,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { useTimesheet } from "../hooks/use-timesheet";
import { TimesheetDashboard } from "./timesheet-dashboard";
import { TimesheetTable } from "./timesheet-table";
import { TimesheetDetailView } from "./timesheet-detail-view";
import { RegisterTimesheetForm } from "./register-timesheet-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/core/presentation/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/core/presentation/components/ui/tabs";

export function TimesheetContent() {
  const {
    view,
    setView,
    role,
    setRole,
    userId,
    filteredRequests,
    requests,
    selectedRequest,
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
  } = useTimesheet();

  const [activeTab, setActiveTab] = useState("all_requests");

  const isAutorizador = role === "Supervisor" || role === "Gerente";

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Module Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              <span>Inicio</span>
              <ChevronRight className="size-3" />
              <span className="text-primary">TimeSheet</span>
            </div>
            <h1 className="text-xl font-bold font-mono tracking-tighter text-foreground flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              TIMESHEET
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="feb_1">
              <SelectTrigger className="h-9 w-40 text-xs bg-secondary/50 border-border">
                <SelectValue placeholder="Quincena" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feb_1">Feb 1ra (01-15)</SelectItem>
                <SelectItem value="feb_2">Feb 2da (16-28)</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="h-9 w-32 text-xs bg-secondary/50 border-border">
                <SelectValue placeholder="RIG" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos (RIG)</SelectItem>
                <SelectItem value="702">RIG 702</SelectItem>
                <SelectItem value="703">RIG 703</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-8 w-px bg-border mx-2" />

            <div className="flex items-center gap-3 pl-2 border-l border-border/50">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-foreground leading-tight">
                  {userId === "USR-103" ? "Carlos Méndez" : "Juan Pérez"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[8px] h-4 px-1.5 font-bold uppercase bg-primary/10 text-primary border-primary/20"
                >
                  {role}
                </Badge>
              </div>
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  CM
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        {view !== "create" && (
          <div className="flex items-center gap-6 px-6 h-12 bg-secondary/20">
            <button
              onClick={() => setView("dashboard")}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors h-full border-b-2 px-1 ${
                view === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors h-full border-b-2 px-1 ${
                view === "list" || view === "detail"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              Listado
            </button>
            <div className="flex-1" />
            <Button
              size="sm"
              className="h-8 bg-primary hover:bg-primary/90 text-white gap-2 text-[10px] font-bold uppercase tracking-wider"
              onClick={() => setView("create")}
            >
              <PlusCircle className="size-3.5" />
              Registrar TimeSheet
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        {view === "dashboard" && (
          <TimesheetDashboard
            role={role}
            stats={stats}
            recentRequests={requests}
            onViewDetail={navigateToDetail}
          />
        )}

        {view === "list" && (
          <div className="flex flex-col gap-6">
            {isAutorizador ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-4 bg-secondary/50 p-1">
                  <TabsTrigger
                    value="all_requests"
                    className="text-xs uppercase font-bold tracking-wider px-6"
                  >
                    Solicitudes por autorizar
                  </TabsTrigger>
                  <TabsTrigger
                    value="my_requests"
                    className="text-xs uppercase font-bold tracking-wider px-6"
                  >
                    Mis Solicitudes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all_requests">
                  <TimesheetTable
                    role={role}
                    requests={filteredRequests}
                    onViewDetail={navigateToDetail}
                    search={search}
                    setSearch={setSearch}
                    statusFilter={filterStatus}
                    setStatusFilter={setFilterStatus}
                    rigFilter={filterRig}
                    setRigFilter={setFilterRig}
                  />
                </TabsContent>
                <TabsContent value="my_requests">
                  <TimesheetTable
                    role={role}
                    requests={filteredRequests.filter(
                      (r) => r.workerId === userId,
                    )}
                    onViewDetail={navigateToDetail}
                    search={search}
                    setSearch={setSearch}
                    statusFilter={filterStatus}
                    setStatusFilter={setFilterStatus}
                    rigFilter={filterRig}
                    setRigFilter={setFilterRig}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <TimesheetTable
                role={role}
                requests={filteredRequests}
                onViewDetail={navigateToDetail}
                search={search}
                setSearch={setSearch}
                statusFilter={filterStatus}
                setStatusFilter={setFilterStatus}
                rigFilter={filterRig}
                setRigFilter={setFilterRig}
              />
            )}
          </div>
        )}

        {view === "detail" && selectedRequest && (
          <TimesheetDetailView
            role={role}
            request={selectedRequest}
            onBack={() => setView("list")}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {view === "create" && (
          <RegisterTimesheetForm
            role={role}
            userId={userId}
            workerName={userId === "USR-103" ? "Carlos Méndez" : "Juan Pérez"}
            onSave={handleSave}
            onCancel={() => setView("dashboard")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-6 mt-12 bg-card/30">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground font-mono">
          <span>Petro Flow — Industrial Field Management System</span>
          <span>Unidad Operativa: RIG-702/703</span>
          <span>V1.4.2</span>
        </div>
      </footer>
    </div>
  );
}
