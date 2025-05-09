import React from "react";

interface productReview {

}

interface productReviewProps {
    
}


const ProductReview : React.FC = () => {
    return (
    <div className="bg-white shadow-md rounded-lg p-4 max-w-xl mx-auto">
    {/* Tiêu đề sản phẩm */}
    <h2 className="text-lg font-bold text-black">
      Đánh giá Điện thoại iPhone 15 Plus 128GB
    </h2>

    {/* Tóm tắt đánh giá tổng quan */}
    <div className="flex items-center mt-2">
      <i className="fas fa-star text-yellow-400 text-2xl"></i>
      <span className="text-2xl font-bold ml-1">4.9</span>
      <span className="text-gray-500 text-sm ml-1">/5</span>
      <span className="text-gray-500 text-sm ml-2">33,3k khách hài lòng</span>
      <a href="#" className="text-blue-600 text-sm ml-2">
        47 đánh giá
      </a>
    </div>

    {/* Phân tích chi tiết đánh giá */}
    <div className="mt-4">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center mb-1">
          <span className="text-sm w-6">{star} ★</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-2">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: star === 5 ? "99.9%" : "0%" }}
            ></div>
          </div>
          <span className="text-sm">{star === 5 ? "99.9%" : "0%"}</span>
        </div>
      ))}
    </div>

    {/* Đánh giá cá nhân */}
    <div className="mt-4">
      {/* Đánh giá 1 */}
      <div className="mb-4">
        <div className="flex items-center">
          <span className="font-bold">Mon Infamily</span>
          <i className="fas fa-check-circle text-green-500 ml-2" ></i>
          <span className="text-green-500 text-sm ml-1">Đã mua tại TGDD</span>
        </div>
        <div className="flex items-center mt-1">
          {[...Array(5)].map((_, i) => (
            <i key={i} className=" fas fa-star text-yellow-400"></i>
          ))}
        </div>
        <div className="mt-1">
          <i className="fas fa-heart text-red-500 inline"></i>
          <span className="text-sm ml-1">
            Sẽ giới thiệu cho bạn bè, người thân
          </span>
        </div>
        <p className="text-sm mt-1">
          Đã mua hàng 114116 Dương số 3. bình hương hoa B. Bình Tân Cách bạn
          nv hỗ trợ nhiệt tình và chuẫn 5
        </p>
        <div className="flex items-center mt-1">
          <i className="fas fa-thumbs-up text-gray-500"></i>
          <span className="text-gray-500 text-sm ml-1">Hữu ích</span>
          <a href="#" className="text-blue-600 text-sm ml-2">
            Đã dùng khoảng 5 ngày
          </a>
        </div>
      </div>

      {/* Đánh giá 2 */}
      <div className="mb-4">
        <div className="flex items-center">
          <span className="font-bold">Tuấn</span>
          <i className="fas fa-check-circle text-green-500 ml-2"></i>
          <span className="text-green-500 text-sm ml-1">Đã mua tại TGDD</span>
        </div>
        <div className="flex items-center mt-1">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fas fa-star text-yellow-400"></i>
          ))}
        </div>
        <p className="text-sm mt-1">Trải nghiệm rất tuyệt</p>
        <div className="flex items-center mt-1">
          <i className="fas fa-thumbs-up text-gray-500"></i>
          <span className="text-gray-500 text-sm ml-1">Hữu ích (19)</span>
          <a href="#" className="text-blue-600 text-sm ml-2">
            Đã dùng khoảng 2 tuần
          </a>
        </div>
      </div>
    </div>

    {/* Nút hành động */}
    <div className="flex justify-between mt-4">
      <button className="border border-gray-300 rounded px-4 py-2 text-black">
        Xem 47 đánh giá
      </button>
      <button className="bg-blue-600 text-white rounded px-4 py-2">
        Viết đánh giá
      </button>
    </div>
  </div>
);
}

export default ProductReview;