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

const Catalogue: React.FC = () => {
  const user = useAppSelector(staticGetUser);

  const [catalogue, setCatalogue] = useState<Bulletin[] | null>(null);

  useEffect(() => {
    if (user && catalogue == null) {
      getAllBulletins(user).then((data: Bulletin[]) => {
        // console.log(data);
        const filteredBulletins = data.filter(
          (bulletin) => bulletin.month !== null
        );
        setCatalogue(filteredBulletins);
      });
    }
  }, [user]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const navigate = useNavigate();
  return (
    <Layout>
      <main>
        <Tabs
          className="flex justify-start"
          defaultValue="2025"
          data-tg-title="tab housing"
        >
          <TabsList>
            <TabsTrigger value="2025">2025</TabsTrigger>
          </TabsList>
        </Tabs>
        <section className="mx-[10vw] grid grid-cols-3 gap-4">
          {months.map((month) => {
            if (catalogue?.find((bulletin) => bulletin.month === month)) {
              return (
                <Card
                  className="w-[175px] h-[175px] mx-auto bg-[#9DBD99] flex items-center justify-center rounded-2xl border-none shadow-none cursor-pointer"
                  onClick={() => {
                    if (
                      catalogue?.find((bulletin) => bulletin.month === month)
                    ) {
                      navigate(
                        `/bulletin/${
                          catalogue.find((bulletin) => bulletin.month === month)
                            ?.id
                        }`
                      );
                    }
                  }}
                >
                  <BulletinPreview
                    className={"scale-[.5] mx-auto"}
                    images={
                      catalogue
                        .find((bulletin) => bulletin.month === month)
                        ?.images.map((image) => {
                          // console.log(image);
                          return `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-preview/${image}.jpeg`;
                        })
                        .slice(0, 4) || []
                    }
                    firstName={
                      catalogue.find((bulletin) => bulletin.month === month)
                        ?.firstName || ""
                    }
                    key={month}
                  />
                </Card>
              );
            } else {
              return <MonthCard month={month} />;
            }
          })}
        </section>
      </main>
    </Layout>
  );
};

export default Catalogue;
