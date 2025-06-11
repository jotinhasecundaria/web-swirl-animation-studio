
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import GaugeChart from "@/components/ui/GaugeChart";
import { getInventoryPercent, type InventoryPercentItem } from "@/data/InventoryPercent";

const InventoryGauges: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryPercentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventoryPercent = async () => {
      try {
        const data = await getInventoryPercent();
        setInventoryData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading inventory percent:", error);
        setLoading(false);
      }
    };

    loadInventoryPercent();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
      <h1 className="px-6 pt-6 text-xl sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
        Estoque Geral
      </h1>
      <p className="px-6 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
        Itens disponíveis no estoque
      </p>
      <CardContent className="grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6 my-0 md:my-3 mt-2 md:mt-0">
        {inventoryData.map((item) => (
          <div key={item.name}>
            <div className="block sm:inline md:hidden">
              <div className="flex flex-col justify-center items-center md:my-0 p-4 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={150}
                />
              </div>
            </div>
            <div className="hidden md:inline xl:hidden">
              <div className="flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={170}
                />
              </div>
            </div>
            <div className="hidden xl:inline">
              <div className="flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md">
                <GaugeChart
                  title={item.name}
                  value={item.value}
                  size={200}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InventoryGauges;
