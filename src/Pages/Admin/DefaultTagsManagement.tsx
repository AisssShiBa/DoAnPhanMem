import React, { useState, useEffect } from "react";

// --- Kiểu dữ liệu ---
interface DefaultTag {
  id: number;
  name: string;
  color: string;
  display_order: number;
}

// --- Danh sách màu sắc cho Tag ---
const TAG_COLORS = [
  { value: "red", class: "bg-red-500/20 text-red-400 border-red-500/50" },
  {
    value: "orange",
    class: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  },
  {
    value: "yellow",
    class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  },
  {
    value: "green",
    class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  },
  { value: "blue", class: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  {
    value: "indigo",
    class: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
  },
  {
    value: "purple",
    class: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  },
  { value: "pink", class: "bg-pink-500/20 text-pink-400 border-pink-500/50" },
];

export default function DefaultTagsManagement() {
  const [tags, setTags] = useState<DefaultTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Form thêm Tag mới
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4].value); // Mặc định màu blue

  // Lấy dữ liệu (Giả lập gọi API)
  useEffect(() => {
    const fetchDefaultTags = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setTags([
          { id: 1, name: "Học tập", color: "blue", display_order: 1 },
          { id: 2, name: "Bài tập lớn", color: "purple", display_order: 2 },
          { id: 3, name: "Việc làm thêm", color: "green", display_order: 3 },
          { id: 4, name: "Cá nhân", color: "orange", display_order: 4 },
        ]);
      } catch (error) {
        console.error("Lỗi khi tải tags mặc định", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDefaultTags();
  }, []);

  // Thêm Tag mới
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: DefaultTag = {
      id: Date.now(), // Tạo ID tạm thời
      name: newTagName.trim(),
      color: selectedColor,
      display_order:
        tags.length > 0 ? Math.max(...tags.map((t) => t.display_order)) + 1 : 1,
    };

    setTags([...tags, newTag]);
    setNewTagName(""); // Reset input
  };

  // Xóa Tag
  const handleDeleteTag = (id: number) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa tag mặc định này? Sinh viên mới sẽ không thấy tag này nữa.",
      )
    ) {
      setTags(tags.filter((tag) => tag.id !== id));
    }
  };

  // Thay đổi thứ tự (Move Up / Move Down)
  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === tags.length - 1) return;

    const newTags = [...tags];
    const targetIndex = direction === "UP" ? index - 1 : index + 1;

    // Đổi chỗ 2 phần tử trong mảng
    [newTags[index], newTags[targetIndex]] = [
      newTags[targetIndex],
      newTags[index],
    ];

    // Cập nhật lại trường display_order cho khớp với mảng
    const updatedOrderTags = newTags.map((tag, idx) => ({
      ...tag,
      display_order: idx + 1,
    }));

    setTags(updatedOrderTags);
  };

  // Hàm tiện ích tìm class màu tương ứng
  const getColorClass = (colorValue: string) => {
    return (
      TAG_COLORS.find((c) => c.value === colorValue)?.class ||
      TAG_COLORS[0].class
    );
  };

  return (
    <div className="p-6 md:p-8 text-white max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Danh Mục & Nhãn Mặc Định
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Thiết lập các bộ Nhãn (Tags) mẫu. Dữ liệu này sẽ được khởi tạo tự động
          cho sinh viên khi họ lần đầu đăng ký tài khoản.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM THÊM MỚI */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleAddTag}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6"
          >
            <h2 className="text-lg font-bold mb-4">Tạo Nhãn Mới</h2>

            {/* Tên Nhãn */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="VD: Câu lạc bộ..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Chọn Màu Sắc */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Màu sắc
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        : "border-transparent hover:scale-105 opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor:
                        color.value === "emerald" ? "#10b981" : color.value,
                    }} // Chữa cháy màu hiển thị nhanh
                  >
                    {/* UI Màu được điều khiển qua className của Tailwind */}
                    <span
                      className={`block w-full h-full rounded-full ${color.class}`}
                    ></span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg"
            >
              + Thêm Nhãn Mặc Định
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH NHÃN */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h3 className="font-bold">Thứ tự hiển thị</h3>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
                {tags.length} nhãn
              </span>
            </div>

            <div className="p-2">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse">
                  Đang tải cấu hình...
                </div>
              ) : tags.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có nhãn mặc định nào.
                </div>
              ) : (
                <ul className="space-y-2">
                  {tags.map((tag, index) => (
                    <li
                      key={tag.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Cột số thứ tự */}
                        <span className="text-gray-500 font-mono text-sm w-6 text-center">
                          {tag.display_order}
                        </span>

                        {/* Hiển thị Tag */}
                        <span
                          className={`px-3 py-1 rounded-md text-sm border font-medium ${getColorClass(tag.color)}`}
                        >
                          # {tag.name}
                        </span>
                      </div>

                      {/* Các nút hành động */}
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMove(index, "UP")}
                          disabled={index === 0}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Chuyển lên"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => handleMove(index, "DOWN")}
                          disabled={index === tags.length - 1}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Chuyển xuống"
                        >
                          ⬇️
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          title="Xóa nhãn"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
