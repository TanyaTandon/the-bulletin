import { useAppDispatch, useAppSelector } from "@/redux";
import { Card } from "./ui/card";
import { createNewBulletin } from "@/lib/api";
import { staticGetUser } from "@/redux/user/selectors";

export function switchMonth(month: number) {
  switch (month) {
    case 1:
      return "jan";
    case 2:
      return "feb";
    case 3:
      return "mar";
    case 4:
      return "apr";
    case 5:
      return "may";
    case 6:
      return "jun";
    case 7:
      return "jul";
    case 8:
      return "aug";
    case 9:
      return "sept";
    case 10:
      return "oct";
    case 11:
      return "nov";
    case 12:
      return "dec";
    default:
      return "";
  }
}
const getFirstOfNextMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 1);
};

const MonthCard: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  const monthTextStyle = {
    color: "#FFF8EB",
    position: "relative" as const,
    zIndex: 10,
    fontSize: "3.75rem",
    fontWeight: 500,
    "--month-number": `"${month}"`,
  } as React.CSSProperties & { "--month-number": string };

  const firstOfNextMonth = getFirstOfNextMonth();
  const nextMonth1Based = firstOfNextMonth.getMonth() + 1;
  const nextYear = firstOfNextMonth.getFullYear();
  const isAddMonth = year === nextYear && month === nextMonth1Based;

  const dispatch = useAppDispatch();

  const user = useAppSelector(staticGetUser);

  return (
    <Card
      className={` ${isAddMonth ? "month-add-hover" : ""
        }  w-[175px] h-[175px] mx-auto bg-[#9DBD99] flex items-center justify-center rounded-2xl border-none`}
      onClick={() => {
        if (isAddMonth) {
          dispatch(createNewBulletin({ user, month, year }));
        }
      }}
    >
      <div className="relative">
        <div className={`month-text`} style={monthTextStyle}>
          <style>{`
            .month-text::before {
              content: var(--month-number);
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 7.5rem;
              font-weight: bold;
              color: #FFF8EB;
              opacity: 0.3;
              z-index: -1;
              pointer-events: none;
              font-family: "Delight", "Inter";
            }
          `}</style>
          <style>{`
            .month-text::after {
              content: "+";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 7.5rem;
              font-weight: bold;
              color: #FFF8EB;
              opacity: 0;
              z-index: -1;
              pointer-events: none;
              font-family: "Delight", "Inter";
            }
          `}</style>
          <p
            className={`${isAddMonth ? "month-text-hover" : ""} `}
            style={{ fontFamily: "Welcome Web" }}
          >
            {switchMonth(month)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MonthCard;
