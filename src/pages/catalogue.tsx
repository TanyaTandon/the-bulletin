import BulletinPreview from "@/components/BulletinPreview";
import Layout from "@/components/Layout";
import MonthCard, { switchMonth } from "@/components/MonthCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bulletin, getAllBulletins } from "@/lib/api";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const getFirstOfNextMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 1);
};

const Catalogue: React.FC = () => {
  const user = useAppSelector(staticGetUser);

  const [catalogue, setCatalogue] = useState<Bulletin[] | null>(null);

  useEffect(() => {
    if (user && catalogue == null) {
      getAllBulletins(user).then((data: Bulletin[]) => {
        const filteredBulletins = data.filter(
          (bulletin) => bulletin.month !== null
        );
        setCatalogue(filteredBulletins);
      });
    }
  }, [user]);

  const firstOfNextMonth = getFirstOfNextMonth();
  const currentYear = new Date().getFullYear();
  const nextMonthYear = firstOfNextMonth.getFullYear();

  // Extract year from created_at timestamp
  const getYearFromCreatedAt = (createdAt: string): number => {
    return new Date(createdAt).getFullYear();
  };

  const years = React.useMemo(() => {
    if (!catalogue) return [currentYear];
    const fromBulletins = new Set<number>(
      catalogue
        .filter((b) => b.created_at)
        .map((b) => getYearFromCreatedAt(b.created_at))
    );
    fromBulletins.add(currentYear);
    fromBulletins.add(nextMonthYear);
    return Array.from(fromBulletins).sort((a, b) => b - a);
  }, [catalogue, currentYear, nextMonthYear]);

  const [selectedYear, setSelectedYear] = useState<string>(() =>
    years.length ? String(years[0]) : String(currentYear)
  );

  useEffect(() => {
    if (years.length && !years.includes(Number(selectedYear))) {
      setSelectedYear(String(years[0]));
    }
  }, [years, selectedYear]);

  const catalogueForYear = React.useMemo(() => {
    if (!catalogue) return [];
    const y = Number(selectedYear);
    return catalogue.filter(
      (b) =>
        b.created_at &&
        getYearFromCreatedAt(b.created_at) === y &&
        b.month != null
    );
  }, [catalogue, selectedYear]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const navigate = useNavigate();

  const getBulletinForMonth = (month: number) =>
    catalogueForYear.find((bulletin) => bulletin.month === month);

  return (
    <Layout>
      <main>
        <Tabs
          className="flex justify-start"
          value={selectedYear}
          onValueChange={setSelectedYear}
          data-tg-title="tab housing"
        >
          <TabsList>
            {years.map((y) => (
              <TabsTrigger key={y} value={String(y)}>
                {y}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <section className="mx-[10vw] grid grid-cols-3 gap-4">
          {months.map((month) => {
            const bulletin = getBulletinForMonth(month);
            if (bulletin) {
              return (
                <Card
                  key={month}
                  className="w-[175px] h-[175px] mx-auto bg-[#9DBD99] flex items-center justify-center rounded-2xl border-none shadow-none cursor-pointer"
                  onClick={() => navigate(`/bulletin/${bulletin.id}`)}
                >
                  <BulletinPreview
                    className={"scale-[.5] mx-auto"}
                    images={
                      bulletin.images
                        ?.map(
                          (image) =>
                            `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-preview/${image}.jpeg`
                        )
                        .slice(0, 4) || []
                    }
                    firstName={bulletin.firstName || ""}
                  />
                </Card>
              );
            }
            return (
              <MonthCard
                key={month}
                month={month}
                year={Number(selectedYear)}
              />
            );
          })}
        </section>
      </main>
    </Layout>
  );
};

export default Catalogue;
