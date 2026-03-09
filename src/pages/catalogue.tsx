import BulletinPreview from "@/components/BulletinPreview";
import Layout from "@/components/Layout";
import MonthCard from "@/components/MonthCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bulletin, createNewBulletin, getAllBulletins } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const getFirstOfNextMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 1);
};

const Catalogue: React.FC = () => {
  const user = useAppSelector(staticGetUser);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const focusMonthMode = searchParams.get("monthAlert") === "true";
  const onboardingMode = searchParams.get("onboarding") === "true";

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
    catalogueForYear.find((bulletin) => Number(bulletin.month) === month);

  const focusMonth = firstOfNextMonth.getMonth();
  const focusYear = firstOfNextMonth.getFullYear();
  const focusBulletin = catalogue?.find(
    (b) =>
      b.created_at &&
      getYearFromCreatedAt(b.created_at) === focusYear &&
      Number(b.month) === focusMonth
  );

  if (focusMonthMode) {
    return (
      <Layout>
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <section className="flex flex-col items-center gap-4">
            {onboardingMode && !focusBulletin && (
              <div className="flex flex-col items-center gap-3 mb-2">
                <p className="text-center text-[22px] font-medium">
                  welcome! let's make your first bulletin.
                </p>
                <p className="text-center text-muted-foreground text-[16px] max-w-xs">
                  we'll walk you through everything — it only takes a few minutes.
                </p>
                <Button
                  variant="primary"
                  disabled={isCreating}
                  onClick={async () => {
                    setIsCreating(true);
                    const res = await dispatch(createNewBulletin({ user })).unwrap();
                    if (res.success) {
                      navigate(`/bulletin/${res.bulletinId}?onboarding=true`);
                    } else {
                      setIsCreating(false);
                    }
                  }}
                >
                  {isCreating ? "creating your bulletin..." : "get started"}
                </Button>
              </div>
            )}
            {!onboardingMode && (
              <p className="text-center text-muted-foreground text-[20px]">
                {focusBulletin
                  ? "you have a bulletin for this month — tap to open it"
                  : "it's a new month! start a new Bulletin to share with your friends at the end of the month."}
              </p>
            )}
            {focusBulletin ? (
              <Card
                className="h-[320px] w-[320px] cursor-pointer rounded-2xl bg-[#9DBD99]  transition-shadow hover:shadow-xl"
                onClick={() => navigate(`/bulletin/${focusBulletin.id}`)}
              >
                <BulletinPreview
                  className="mx-auto scale-[0.8]"
                  images={
                    focusBulletin.images
                      ?.map(
                        (image) =>
                          `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-preview/${image}.jpeg`
                      )
                      .slice(0, 4) || []
                  }
                  firstName={focusBulletin.firstName || ""}
                />
              </Card>
            ) : (
              !onboardingMode && (
                <MonthCard
                  month={focusMonth}
                  year={focusYear}
                  className="h-[250px] w-[250px] rounded-2xl ring-4 ring-primary/50 ring-offset-4 shadow-lg"
                />
              )
            )}
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="px-3 md:px-[10vw] pt-2">
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
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {months.map((month) => {
            const bulletin = getBulletinForMonth(month);
            if (bulletin) {
              return (
                <div key={month} className="w-full aspect-square md:w-[175px] md:h-[175px] mx-auto">
                  <Card
                    className="w-full h-full bg-[#9DBD99] flex items-center justify-center rounded-2xl border-none shadow-none cursor-pointer overflow-hidden"
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
                </div>
              );
            }
            return (
              <div key={month} className="w-full aspect-square md:w-[175px] md:h-[175px] mx-auto">
                <MonthCard
                  month={month}
                  year={Number(selectedYear)}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </section>
      </main>
    </Layout>
  );
};

export default Catalogue;
