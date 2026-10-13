"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockApplications = [
  { id: "1", company: "GoTo", role: "Tech Lead", status: "INTERVIEW", stage: "User Interview", salary: "Rp 35.000.000" },
  { id: "2", company: "Shopee", role: "Senior Fullstack", status: "TECH_TEST", stage: "Live Coding Test", salary: "Rp 32.000.000" },
  { id: "3", company: "Traveloka", role: "Frontend Architect", status: "SCREENING", stage: "HR Screening", salary: "Rp 30.000.000" },
  { id: "4", company: "Fintech SG", role: "Lead Engineer", status: "OFFERING", stage: "Contract Review", salary: "Rp 45.000.000" },
];

export default function CareerPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Career Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Job hunting CRM dari Wishlist hingga Offering dengan fitur konversi 1-klik ke Employment.
          </p>
        </div>

        <Button className="h-10 text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Tambah Lamaran
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Screening", "Interview", "Tech Test", "Offering"].map((col) => (
          <div key={col} className="p-4 rounded-3xl bg-card border border-card-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-card-border">
              <span className="text-xs font-bold text-foreground">{col}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-border text-foreground font-semibold">
                1
              </span>
            </div>

            {mockApplications
              .filter((app) => app.stage.toLowerCase().includes(col.toLowerCase()))
              .map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-background border border-card-border hover:border-neon/40 transition-all space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{app.company}</span>
                    <Badge variant="processing" className="text-[9px]">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-neon font-bold">{app.salary}</span>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
