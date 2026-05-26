"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { listMedicines, searchMedicines, type Medicine } from "@/lib/api/medicines";

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["medicines", search],
    queryFn: async ({ pageParam = 0, signal }) => {
      const limit = 20;
      if (search) {
        return searchMedicines(search, limit, pageParam, signal);
      }
      return listMedicines({ limit, offset: pageParam }, signal);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
      if (currentCount < lastPage.total) {
        return currentCount;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const medicines = data?.pages.flatMap((page) => page.data) || [];

  const handleAskAI = (medicineName: string) => {
    toast.info(`AI features for ${medicineName} are currently being developed. Stay tuned!`, {
      icon: <Icons.activity className="h-5 w-5 text-blue-500" />
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medicine Catalog</h1>
          <p className="text-slate-500 mt-1">Browse available medicines and request AI analysis.</p>
        </div>
        
        <div className="w-full md:w-72">
          <div className="relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-8 bg-white/80 shadow-sm" 
              placeholder="Search medicines..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading...</div>
        ) : medicines.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/50 rounded-2xl border border-dashed border-gray-300">
            <Icons.pill className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No data available</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <>
            {medicines.map((medicine: Medicine) => (
              <Card key={medicine.id} className="group overflow-hidden border-none shadow-lg bg-white/60 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-3 border-b border-gray-100/50 bg-white/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">{medicine.name}</CardTitle>
                      <CardDescription className="text-indigo-600 font-medium mt-1">{medicine.type || 'Unknown Type'}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${medicine.stock && medicine.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {medicine.stock && medicine.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Recommended Brands / Details</p>
                      <p className="text-sm text-slate-700">{medicine.recommended_brands || medicine.dosage_options?.join(", ") || 'No specific details'}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100/50 flex justify-end">
                      <Button 
                        variant="outline" 
                        className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-full sm:w-auto transition-colors"
                        onClick={() => handleAskAI(medicine.name)}
                      >
                        <Icons.activity className="h-4 w-4" />
                        Ask AI for Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Intersection Observer target for lazy loading */}
            <div ref={ref} className="col-span-full py-4 text-center h-10 flex items-center justify-center">
              {isFetchingNextPage ? (
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  Loading more medicines...
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-slate-400">Scroll down to load more</span>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
