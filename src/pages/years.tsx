import EventCard from "@/components/eventCard";
import { Event, XataClient } from "@/xata/xata";
import groupBy from "lodash-es/groupBy";
import { useMemo } from "react";

export default function Years({ events }: { events: Event[] }) {
  const groupByYearEvents = useMemo(
    () =>
      groupBy(events, (e) =>
        e.startDate ? new Date(e.startDate).getFullYear() : "no-date"
      ),
    [events]
  );

  const years = Object.keys(groupByYearEvents);

  return (
    <div className="">
      <div className="mb-4 border rounded-xl p-6 bg-white">
        <p className="text-gray-600">
          FurryEventChina.com{" "}
          {years.filter((year) => year !== "no-date").length} 年共收录到{" "}
          {events.length} 个活动，历年活动数据如下：
        </p>
      </div>
      {Object.keys(groupByYearEvents)
        .sort((a, b) => {
          if (a !== "no-date" && b !== "no-date") {
            return Number(b) - Number(a);
          }
          if (a === "no-date") {
            return -1;
          }
          if (b === "no-date") {
            return 1;
          }
          return 0;
        })
        .map((yearLabel) => (
          <section
            key={yearLabel}
            className="mb-4 border rounded-xl p-6 bg-white"
          >
            <h1 className="font-bold text-gray-400 text-3xl mb-4">
              {yearLabel === "no-date" ? "暂未定档" : yearLabel}
            </h1>
            <p className="text-gray-600 mb-4">
              {yearLabel}年共有 {groupByYearEvents[yearLabel].length} 场活动：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {groupByYearEvents[yearLabel].map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

export async function getStaticProps() {
  const xata = new XataClient();

  const events = await xata.db.event
    .select([
      "name",
      "address",
      "city",
      "coverUrl",
      "logoUrl",
      "startDate",
      "endDate",
      "slug",
      "organization.name",
      "organization.slug",
    ])
    .getAll();
  const cities = Object.keys(groupBy(events, (event) => event.city));
  return {
    props: {
      events,
      headMetas: {
        title: "年度时间轴 FEC·兽展日历",
        des: `欢迎来到FEC·兽展日历！FEC·兽展日历共收录来自中国大陆的 ${cities} 个城市举办过的 ${events.length} 场 Furry 相关的展会活动，你去过多少次呢？愿你能在这里找到最美好的回忆！`,
        link: "https://www.furryeventchina.com/years",
      },
      structuredData: {
        breadcrumb: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "年度时间轴",
              item: "https://www.furryeventchina.com/years/",
            },
          ],
        },
      },
    },
  };
}
