// mapId: 0=1F_2F, 1=3F_4F, 2=Gym, 3=Lib, 4=OutSmall, 5=OutLarge
export const MapPins: Record<string, { mapId: number; x: number; y: number }> = {
  教室: { mapId: 0, x: 460, y: 525 },
  第1体育館: { mapId: 2, x: 400, y: 450 },
  ラウンジA: { mapId: 0, x: 500, y: 500 },
  図書館: { mapId: 3, x: 500, y: 500 },
};

// category, title, map image path
export const mapList = [
  { category: "校舎", title: "1F / 中庭", src: "" },
  { category: "校舎", title: "2F / 3F", src: "" },
  { category: "建物", title: "第1体育館", src: "" },
  { category: "建物", title: "図書館", src: "" },
  { category: "全体", title: "模擬店", src: "" },
  { category: "全体", title: "全体図", src: "/img/test.map.jpg" },
];