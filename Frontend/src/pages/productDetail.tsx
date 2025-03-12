import ProductDetail from "../components/productDetail";
import { useParams} from 'react-router-dom';

function ProductGH() {
    const {phone_name} = useParams();
    const productData = fetchProductByName(phone_name || "");
    
    return (
        <div className="product-detail">
            {productData ? <ProductDetail product={productData} /> : <div>Product not found</div>}
        </div>
    );
};



const products = [
  {
    "productId": "67cff271b6dd012f66cbba00",
    "productName": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng",
    "description": "",
    "brand": "OPPO",
    "images": {
        "default": [
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
                "title": ""
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
                "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
            }
        ]
    },
    "type": "PHONE",
    "warrantyPeriod": null,
    "productReviews": [
        {
            "content": "Bảng so sánh thông số kỹ thuật giữa OPPO Find N3 Flip 5G Hồng và OPPO Find N2 Flip Dưới đây sẽ là bảng tổng hợp thông số kỹ thuật giữa hai thế hệ điện thoại gập của OPPO: Tiêu chí OPPO Find N3 Flip 5G Hồng OPPO Find N2 Flip Màn hình chính • Tấm nền AMOLED  • Độ phân giải Full HD+ (1080 x 2520 Pixels)  • Kích thước 6.8 inch  • ​ Tấm nền AMOLED  • Độ phân giải Full HD+ (1080 x 2520 Pixels)  • Kích thước 6.8 inch Màn hình phụ  • Tấm nền AMOLED  • Độ phân giải 382 x 720 Pixels  • Kích thước 3.26 inch  • Tấm nền AMOLED  • Độ phân giải 382 x 720 Pixels  • Kích thước 3.26 inch Camera  • Camera chính 50 MP (chống rung OIS)  • Camera góc siêu rộng 48 MP  • Camera tele 32 MP  • Camera trước 32 MP  • ​Camera chính 50 MP  • Camera góc siêu rộng 8 MP • Camera trước 32 MP Chip xử lý Dimensity 9200 5G Dimensity 9000+ 5G Thời lượng pin ​4300 mAh 4300 mAh Bộ nhớ  • ​RAM 12 GB  • ​ROM 256 GB  • RAM 8 GB  • ​ROM 256 GB Chất liệu mặt lưng Kính cường lực Gorilla Glass 7 Kính cường lực Gorilla Glass 5",
            "title": "OPPO Find N3 Flip 5G Hồng được OPPO cho ra mắt chính thức tại thị trường Việt Nam vào tháng 10/2023. Sản phẩm được hãng đầu tư mạnh mẽ về camera với độ phân giải lên đến 50 MP, cấu hình sử dụng chip Dimensity 9200 5G và thiết kế được thay đổi với bản lề gập mở tốt hơn cùng màu hồng sang trọng và nữ tính."
        },
        {
            "content": "OPPO Find N3 Flip 5G Hồng sở hữu thiết kế gập độc đáo, giúp điện thoại trở nên nhỏ gọn và tiện lợi. Người dùng có thể dễ dàng gấp gọn điện thoại để cầm nắm và lưu trữ thuận tiện. Điều này mang lại trải nghiệm sử dụng dễ dàng và tiện lợi, đặc biệt khi di chuyển hoặc muốn tiết kiệm không gian. OPPO Find N3 Flip 5G Hồng gây ấn tượng với thiết kế mỏng chỉ 7.79 mm (khi mở), tạo nên sự tinh tế và thanh lịch. Thiết kế này không chỉ mang lại giá trị thẩm mỹ mà còn là minh chứng cho sự tiến bộ trong công nghệ sản xuất điện thoại gập. Khung viền kim loại sáng bóng và mặt lưng kính cao cấp mang đến cho điện thoại vẻ ngoài sang trọng và đẳng cấp. Chất liệu này không chỉ tạo nên vẻ đẹp tinh tế mà còn đảm bảo sự chắc chắn và bền bỉ. OPPO Find N3 Flip 5G Hồng có bản lề Flex được làm từ chất liệu kim loại cao cấp, đảm bảo độ bền cao giúp máy trở nên chắc chắn và cứng cáp. Phần này được cải tiến để mang đến trải nghiệm mở ra và đóng lại một cách êm ái, ổn định. Một trong những điểm đặc biệt của OPPO Find N3 Flip 5G Hồng là việc trang bị màn hình phụ kích thước lớn ở mặt lưng . Màn hình này giúp người dùng dễ dàng thao tác các tính năng khi điện thoại đang gập. Người dùng có thể kiểm tra thông báo, trả lời cuộc gọi hoặc sử dụng ứng dụng như chụp ảnh, quay video,... mà không cần mở hoàn toàn điện thoại.",
            "title": "Thiết kế trẻ trung, sang trọng"
        },
        {
            "content": "OPPO Find N3 Flip 5G Hồng sở hữu bộ 3 camera sau với độ phân giải lần lượt là 50 MP, 48 MP và 32 MP. Với sự đa dạng về ống kính và chế độ chụp, sản phẩm cho phép người dùng khám phá nhiều khía cạnh khác nhau trong nhiếp ảnh, từ chụp ảnh chân dung, phong cảnh đến chụp ảnh zoom xa. OPPO Find N3 Flip 5G Hồng được trang bị camera chính với độ phân giải 50 MP và khẩu độ f/1.8. Với sự kết hợp này, camera chính của máy có thể chụp ảnh sắc nét và chi tiết trong nhiều điều kiện ánh sáng khác nhau. Trong điều kiện thiếu sáng, camera chính của Find N3 Flip 5G Hồng vẫn có thể chụp được những bức ảnh sáng rõ nhờ khả năng thu sáng tốt. Còn trong điều kiện ánh sáng mạnh, camera chính của máy sẽ giúp bạn chụp được những bức ảnh rực rỡ, không bị cháy sáng. Camera góc siêu rộng 48 MP của Find N3 Flip 5G Hồng cho phép bạn chụp ảnh với độ bao quát rộng hơn, lên đến 114 độ. Điều này đặc biệt hữu ích khi bạn muốn chụp ảnh phong cảnh hoặc chụp ảnh nhóm đông người. Với độ phân giải cao, camera này cũng có thể chụp ảnh chi tiết và sắc nét, ngay cả khi chụp ở khoảng cách xa. Camera tele 32 MP của Find N3 Flip 5G Hồng cho phép bạn chụp ảnh cận cảnh hoặc chụp ảnh từ xa. Với công nghệ chống rung tiên tiến, bạn có thể chụp ảnh rõ ràng và sắc nét, hạn chế được tình trạng rung lắc gây nhòe mờ. OPPO Find N3 Flip 5G Hồng không chỉ ấn tượng về cấu hình camera mà còn với việc hợp tác độc đáo với Hasselblad - một thương hiệu danh tiếng trong lĩnh vực máy ảnh. Điều này đảm bảo rằng Find N3 Flip 5G Hồng không chỉ chụp ảnh sắc nét và chi tiết, mà còn tái hiện chính xác màu sắc và tính năng độc đáo của các sản phẩm Hasselblad. OPPO Find N3 Flip 5G Hồng là một chiếc điện thoại thông minh đa năng, không chỉ chụp ảnh tốt mà còn quay video ấn tượng. Với khả năng quay video 4K ở tốc độ 30 khung hình/giây, bạn có thể ghi lại những khoảnh khắc đáng nhớ một cách sống động và chân thực thông qua chiếc điện thoại OPPO này. Ngoài ra, camera trước 32 MP của Find N3 Flip 5G Hồng cũng rất ấn tượng, phù hợp cho những người yêu thích chụp ảnh selfie. Camera này được trang bị chế độ làm đẹp và xóa phông, giúp bạn dễ dàng có được những bức ảnh tự sướng đẹp mắt và cuốn hút.",
            "title": "Camera hợp tác với Hasselblad"
        },
        {
            "content": "Màn hình của chiếc điện thoại OPPO Find N này là một trong những điểm đặc biệt và ấn tượng, với nhiều tính năng và công nghệ hiện đại đảm bảo mang lại trải nghiệm tuyệt vời cho người dùng. OPPO Find N3 Flip 5G Hồng được trang bị màn hình AMOLED với độ phân giải Full HD+ (1080 x 2520 Pixels). Với tấm nền này, Find N3 Flip 5G Hồng mang đến trải nghiệm màu sắc rực rỡ và sống động, với độ tương phản cao và màu đen sâu thẳm. Điều này giúp bạn tận hưởng những bộ phim, video và trò chơi yêu thích của mình với chất lượng hình ảnh tuyệt vời. Ngoài ra, màn hình chính của Find N3 Flip 5G Hồng có kích thước lên đến 6.8 inch, tạo nên một không gian hiển thị rộng rãi. Điều này giúp bạn có thể thoải mái xem nội dung mà không cần phải lo lắng về việc bị che khuất tầm nhìn. OPPO Find N3 Flip 5G Hồng được trang bị tốc độ làm mới 120 Hz, giúp cải thiện đáng kể độ nhạy và độ mượt của màn hình. Điều này mang lại trải nghiệm sử dụng mượt mà và thú vị hơn khi cuộn màn hình, chơi game hoặc duyệt web. Ngoài ra, màn hình chính của Find N3 Flip 5G Hồng còn có độ sáng tối đa lên đến 1600 nits, giúp bạn có thể xem nội dung rõ ràng ngay cả trong điều kiện ánh sáng mạnh. Tính năng này đặc biệt hữu ích khi bạn sử dụng điện thoại ngoài trời nắng gắt. Bên cạnh màn hình chính, Find N3 Flip 5G Hồng còn được trang bị màn hình phụ 3.26 inch ở mặt lưng. Màn hình phụ này giúp bạn có thể xem thông báo và điều khiển điện thoại ngay cả khi màn hình chính đang đóng. Để đảm bảo sự bền vững và độ bảo vệ tối ưu cho màn hình chính, OPPO Find N3 Flip 5G Hồng sử dụng kính siêu mỏng Schott Ultra Thin Glass, lớp kính này giúp bảo vệ màn hình khỏi trầy xước và hạn chế nguy cơ hỏng hóc trong quá trình sử dụng nhằm kéo dài tuổi thọ của điện thoại.",
            "title": "Màn hình AMOLED kích thước lớn"
        },
        {
            "content": "Sức mạnh của OPPO Find N3 Flip 5G Hồng bắt đầu từ việc tích hợp chip MediaTek Dimensity 9200 5G 8 nhân. Với hiệu suất mạnh mẽ và khả năng đa nhiệm ưu việt, chiếc điện thoại Android này sẽ không gặp khó khăn trong việc xử lý mọi tác vụ, từ công việc hằng ngày đến giải trí đa phương tiện. MediaTek Dimensity 9200 là vi xử lý (CPU) được sản xuất dựa trên tiến trình 4 nm và mạnh mẽ nhất hiện tại của MediaTek (10/2023). Đây cũng là con chip đầu tiên sở hữu nhân hiệu năng Armv9 độc quyền cùng sự tối ưu hoá nhiệt độ bởi MediaTek, nhằm đem đến cho chiếc smartphone hiệu năng tối đa mà vẫn giữ ổn định được nhiệt độ. Với kiến trúc Armv9 và tiến trình 4 nm, Dimensity 9200 mang lại hiệu năng vượt trội so với các thế hệ chip MediaTek trước đây. Con chip này có thể dễ dàng xử lý các tác vụ nặng như chơi game, chỉnh sửa video và đồ họa,... OPPO Find N3 Flip 5G Hồng hỗ trợ RAM lên đến 12 GB, cho phép bạn mở nhiều ứng dụng cùng lúc mà không gặp chậm trễ. Điều này rất hữu ích khi bạn cần thực hiện nhiều công việc cùng một lúc hoặc khi bạn muốn chuyển đổi nhanh giữa các ứng dụng mà không bị gián đoạn. Với sức mạnh của chip MediaTek Dimensity 9200 và RAM lớn, OPPO Find N3 Flip 5G Hồng là một lựa chọn tuyệt vời cho các game thủ. Bạn có thể chơi những tựa game đòi hỏi đồ họa cao mà không phải lo lắng về hiệu suất. Thấy hình ảnh chuyển động mượt mà và đẹp mắt sẽ làm cho trải nghiệm chơi game trở nên hấp dẫn hơn bao giờ hết. OPPO Find N3 Flip 5G Hồng sử dụng hệ điều hành Android 13, mang lại tính tiện lợi cao cấp và khả năng tùy biến mạnh mẽ. Bạn sẽ có trải nghiệm mượt mà, giao diện đẹp mắt và cập nhật bảo mật thường xuyên từ Google.",
            "title": "Cấu hình mạnh mẽ trong phân khúc giá"
        },
        {
            "content": "Một trong những yếu tố quan trọng nhất mà người dùng điện thoại di động quan tâm là thời lượng pin. OPPO Find N3 Flip 5G Hồng đã đáp ứng mọi kỳ vọng về pin bằng việc trang bị viên pin lớn với dung lượng lên đến 4300 mAh, đảm bảo bạn luôn có đủ năng lượng để sử dụng suốt một ngày dài mà không cần lo lắng về việc sạc pin. OPPO Find N3 Flip 5G Hồng đã tận dụng không gian bên trong để tích hợp viên pin lớn một cách thông minh, mà không làm ảnh hưởng đến thiết kế mỏng và sang trọng của chiếc điện thoại. Việc này giúp cho OPPO Find N3 Flip 5G Hồng không chỉ là một thiết bị mạnh mẽ mà còn là một chiếc điện thoại đẹp mắt. Ngoài việc có viên pin lớn, OPPO Find N3 Flip 5G Hồng còn hỗ trợ sạc nhanh với công suất tối đa lên đến 44 W. Điều này có nghĩa là bạn có thể nạp đầy pin trong thời gian ngắn, giúp bạn sẵn sàng cho mọi cuộc hành trình và công việc mà không cần phải chờ đợi lâu. Khả năng sạc nhanh này làm cho việc sạc pin trở nên tiện lợi hơn bao giờ hết.",
            "title": "Sở hữu viên pin 4300 mAh cùng khả năng sạc 44 W"
        },
        {
            "content": "Từ ngày 26/10 - 10/11, Thế Giới Di Động triển khai chương trình khuyến mãi hấp dẫn dành cho OPPO Find N3 Flip 5G Hồng. Theo đó, khách hàng mua sản phẩm sẽ được hưởng các ưu đãi sau: Tai nghe OPPO Enco Air 3 (Trị giá 1.59 triệu) Khách hàng mua OPPO Find N3 Flip 5G Hồng sẽ được tặng kèm tai nghe OPPO Enco Air 3 trị giá 1.59 triệu đồng. Tai nghe có thiết kế thời trang, nhỏ gọn, cùng chất lượng âm thanh sống động, đáp ứng nhu cầu giải trí và nghe gọi của người dùng. Thu cũ đổi mới trợ giá đến 2 triệu Khách hàng có thể đổi máy cũ lấy máy mới OPPO Find N3 Flip 5G Hồng với mức trợ giá lên đến 2 triệu đồng. Đây là chương trình hỗ trợ thiết thực giúp khách hàng tiết kiệm chi phí khi mua sắm. Trả góp 0% Thế Giới Di Động hỗ trợ trả góp 0% lãi suất cho OPPO Find N3 Flip 5G Hồng. Khách hàng có thể mua máy với số tiền nhỏ hơn mỗi tháng, phù hợp với khả năng tài chính. Premium Service (Trị giá 1.2 Triệu) Thế Giới Di Động cung cấp dịch vụ Premium Service trị giá 1.2 triệu đồng cho OPPO Find N3 Flip 5G Hồng. Dịch vụ này bao gồm các ưu đãi độc quyền, bảo dưỡng định kỳ và hỗ trợ từ đội ngũ chuyên nghiệp. Xem thêm: Trải nghiệm ngay dịch vụ Premium Service và OPPO Care khi mua OPPO Find N3 Series OPPO Care (Trị giá 4.5 Triệu) Khi mua OPPO Find N3 Flip 5G Hồng tại Thế Giới Di Động, bạn sẽ được tặng gói dịch vụ OPPO Care trị giá 4.5 triệu đồng. Khách hàng sẽ được bảo hành màn hình nếu vô tình xảy ra rơi vỡ, hoàn toàn miễn phí trong vòng 12 tháng tính từ lúc mua. Giá bán điện thoại: Dự kiến khoảng 22.990.000đ (cập nhật ngày 01/11). Tổng kết, OPPO Find N3 Flip 5G Hồng là một chiếc điện thoại gập đáng sắm nhờ sở hữu nhiều điểm nổi bật. Máy vừa có cấu hình mạnh, vừa sở hữu camera chất lượng cùng một thiết kế có vẻ đẹp khó cưỡng, rất phù hợp cho những bạn trẻ năng động đang cần tìm một sự phá cách độc đáo thông qua điện thoại gập.",
            "title": "Giá bán của OPPO Find N3 Flip 5G Hồng"
        }
    ],
    "promotions": [
        "Khuyến mãi",
        "Giá và khuyến mãi dự kiến áp dụng đến 23:59 | 09/03",
        "Tặng gói dịch vụ bảo hành cao cấp - OPPO Premium Service Xem chi tiết",
        "Phiếu mua hàng trị giá 1,000,000đ mua tablet (trừ Ipad) có giá niêm yết từ 10,000,000đ",
        "Tặng Phiếu mua hàng mua đơn hàng từ 250,000đ các sản phẩm miếng dán kính, cáp, sạc, sạc dự phòng, ốp lưng, loa di động, loa vi tính và đồng hồ trị giá 50,000đ.",
        "Phiếu mua hàng áp dụng mua tất cả sim có gói Mobi, Itel, Local, Vina và VNMB trị giá 50,000đ. (Xem chi tiết tại đây)",
        "Nhập mã VNPAYTGDD1 giảm từ 40,000đ đến 150,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR. (Xem chi tiết tại đây)",
        "Thu cũ Đổi mới: Giảm đến 2,000,000đ (Không kèm ưu đãi thanh toán qua cổng, mua kèm) Xem chi tiết"
    ],
    "release": "10/2023",
    "original_prices": [
        "22.990.000₫"
    ],
    "current_prices": [
        "16.990.000₫"
    ],
    "specifications": [
        {
            "name": "Hệ điều hành",
            "value": "Android 13"
        },
        {
            "name": "Vi xử lý",
            "value": "MediaTek Dimensity 9200 5G 8 nhân"
        },
        {
            "name": "Tốc độ chip",
            "value": "1 nhân 3.05 GHz, 3 nhân 2.85 GHz & 4 nhân 1.8 GHz"
        },
        {
            "name": "Chip đồ họa",
            "value": "Immortalis-G715 MC11"
        },
        {
            "name": "RAM",
            "value": "12 GB"
        },
        {
            "name": "Dung lượng",
            "value": "256 GB"
        },
        {
            "name": "Dung lượng khả dụng",
            "value": "239 GB"
        },
        {
            "name": "Danh bạ",
            "value": "Không giới hạn"
        },
        {
            "name": "Độ phân giải camera sau",
            "value": "Chính 50 MP & Phụ 48 MP, 32 MP"
        },
        {
            "name": "Quay phim camera sau",
            "value": [
                "HD 720p@60fps",
                "HD 720p@480fps",
                "HD 720p@30fps",
                "FullHD 1080p@60fps",
                "FullHD 1080p@30fps",
                "FullHD 1080p@240fps",
                "4K 2160p@30fps"
            ]
        },
        {
            "name": "Đèn flash",
            "value": "Có"
        },
        {
            "name": "Tính năng camera sau",
            "value": [
                "Ảnh Raw",
                "Zoom quang học",
                "Zoom kỹ thuật số",
                "Xóa phông",
                "Tự động lấy nét (AF)",
                "Trôi nhanh thời gian (Time Lapse)",
                "Toàn cảnh (Panorama)",
                "Siêu độ phân giải",
                "Quét tài liệu",
                "Quét mã QR",
                "Quay chậm (Slow Motion)",
                "Phơi sáng",
                "Nhãn dán (AR Stickers)",
                "Làm đẹp",
                "HDR",
                "Góc siêu rộng (Ultrawide)",
                "Google Lens",
                "Chụp hẹn giờ",
                "Chống rung quang học (OIS)",
                "Chuyên nghiệp (Pro)",
                "Bộ lọc màu",
                "Ban đêm (Night Mode)"
            ]
        },
        {
            "name": "Độ phân giải camera trước",
            "value": "32 MP"
        },
        {
            "name": "Tính năng camera trước",
            "value": [
                "Xóa phông",
                "Trôi nhanh thời gian (Time Lapse)",
                "Toàn cảnh (Panorama)",
                "Quay video HD",
                "Quay video Full HD",
                "Quay video 4K",
                "Nhãn dán (AR Stickers)",
                "Làm đẹp",
                "HDR",
                "Góc rộng (Wide)",
                "Chụp đêm",
                "Chống rung",
                "Bộ lọc màu"
            ]
        },
        {
            "name": "Công nghệ màn hình",
            "value": "AMOLED"
        },
        {
            "name": "Độ phân giải màn hình",
            "value": "Chính: FHD+ (1080 x 2520 Pixels) & Phụ: SD (382 x 720 Pixels)"
        },
        {
            "name": "Màn hình rộng",
            "value": "Chính 6.8\" & Phụ 3.26\" - Tần số quét Chính: 120 Hz & Phụ: 60 Hz"
        },
        {
            "name": "Độ sáng tối đa",
            "value": "Chính 1600 nits & Phụ 900 nits"
        },
        {
            "name": "Mặt kính cảm ứng",
            "value": "Chính: Kính siêu mỏng Schott UTG & Phụ: Corning Gorilla Glass 7"
        },
        {
            "name": "Dung lượng pin",
            "value": "4300 mAh"
        },
        {
            "name": "Loại pin",
            "value": "Li-Po"
        },
        {
            "name": "Hỗ trợ sạc tối đa",
            "value": "44 W"
        },
        {
            "name": "Công nghệ pin",
            "value": [
                "Tiết kiệm pin",
                "Sạc siêu nhanh SuperVOOC",
                "Siêu tiết kiệm pin"
            ]
        },
        {
            "name": "Bảo mật nâng cao",
            "value": [
                "Mở khoá vân tay cạnh viền",
                "Mở khoá khuôn mặt"
            ]
        },
        {
            "name": "Tính năng đặc biệt",
            "value": [
                "Ứng dụng kép (Nhân bản ứng dụng)",
                "Đa cửa sổ (chia đôi màn hình)",
                "Âm thanh Dolby Atmos",
                "Trợ lý ảo Google Assistant",
                "Thu nhỏ màn hình sử dụng một tay",
                "Mở rộng bộ nhớ RAM",
                "Khoá ứng dụng",
                "HDR10+",
                "DCI-P3",
                "Cử chỉ màn hình tắt",
                "Chế độ trẻ em (Không gian trẻ em)",
                "Chạm 2 lần tắt/sáng màn hình"
            ]
        },
        {
            "name": "Kháng nước, bụi",
            "value": "IPX4"
        },
        {
            "name": "Ghi âm",
            "value": [
                "Ghi âm mặc định",
                "Ghi âm cuộc gọi"
            ]
        },
        {
            "name": "Xem phim",
            "value": [
                "MP4",
                "AV1",
                "3GP"
            ]
        },
        {
            "name": "Nghe nhạc",
            "value": [
                "OGG",
                "MP3",
                "Midi",
                "FLAC"
            ]
        },
        {
            "name": "Mạng di động",
            "value": "Hỗ trợ 5G"
        },
        {
            "name": "SIM",
            "value": "2 Nano SIM"
        },
        {
            "name": "WiFi",
            "value": [
                "Wi-Fi hotspot",
                "Wi-Fi Direct",
                "Wi-Fi 802.11 a/b/g/n/ac/ax",
                "Wi-Fi 6",
                "Dual-band (2.4 GHz/5 GHz)"
            ]
        },
        {
            "name": "GPS",
            "value": [
                "QZSS",
                "GPS",
                "GLONASS",
                "GALILEO",
                "BEIDOU"
            ]
        },
        {
            "name": "Bluetooth",
            "value": [
                "v5.3"
            ]
        },
        {
            "name": "Jack tai nghe",
            "value": "Type-C"
        },
        {
            "name": "Kết nối khác",
            "value": [
                "OTG",
                "NFC"
            ]
        },
        {
            "name": "Kiểu thiết kế",
            "value": "Nguyên khối"
        },
        {
            "name": "Chất liệu",
            "value": "Khung nhôm & Mặt lưng kính cường lực Gorilla Glass 7"
        },
        {
            "name": "Kích thước, khối lượng",
            "value": "Dài 166.42 mm - Ngang 75.78 mm - Dày 7.79 mm - Nặng 198 g"
        }
    ],
    "colors": [
        "Hồng"
    ],
    "quantities": [
        41
    ],
    "variants": [],
    "productNames": [
        "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng"
    ]
  },
  {
    "productId": "67cff271b6dd012f66cbba01",
    "productName": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng",
    "description": "",
    "brand": "OPPO",
    "images": {
        "Đen": [
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Slider/oppo-find-n3-flip638334082319616358.jpg",
                "title": ""
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-1-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-2-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-3-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-4-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-5-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-6-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-7-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-8-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-9-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-10-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-11-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-12-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-13-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-14-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-15-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Kit/oppo-find-n3-flip-phu-kien-org.jpg",
                "title": "Bộ sản phẩm gồm: Ốp lưng, Sách hướng dẫn, Hộp, Cáp Type C, Củ sạc nhanh rời đầu Type A, Cây lấy sim"
            }
        ],
        "Vàng đồng": [
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Slider/oppo-find-n3-flip638334082319616358.jpg",
                "title": ""
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-1-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-2-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-3-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-4-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-5-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-6-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-7-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-8-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-9-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-10-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-11-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-12-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-13-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-14-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-15-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-16-180x125.jpg",
                "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
            },
            {
                "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Kit/oppo-find-n3-flip-phu-kien-org.jpg",
                "title": "Bộ sản phẩm gồm: Ốp lưng, Sách hướng dẫn, Hộp, Cáp Type C, Củ sạc nhanh rời đầu Type A, Cây lấy sim"
            }
        ]
    },
    "type": "PHONE",
    "warrantyPeriod": null,
    "productReviews": [
        {
            "content": "Là điện thoại gập dọc thế hệ tiếp theo của OPPO, Find N3 Flip kế thừa cũng như cải tiến về thiết kế trên phiên bản cũ. Điều này làm cho trải nghiệm sử dụng trở nên thú vị hơn so với các sản phẩm thông thường. Về tổng quan về ngoại hình, máy có kích thước khá dài và thanh mảnh, khi mở hoàn toàn, Find N3 Flip đạt đến 166.42 mm, nhưng khi mình gập lại, kích thước giảm xuống chỉ còn 85.54 mm. Việc này giúp cho máy trở nên nhỏ gọn và dễ cầm nắm hơn, đặc biệt là khi bỏ vào túi quần mà không gặp khó khăn hay gây phiền toái khi ngồi lái xe hoặc làm việc. Mặt lưng của Find N3 Flip được làm từ kính cường lực, hoàn thiện vô cùng tỉ mỉ, tạo nên vẻ đẹp mắt và cảm giác sờ chạm dễ chịu. Khả năng chống bám vân tay hiệu quả giúp giữ cho máy luôn sạch sẽ và dễ vệ sinh. Mình đã dùng máy một thời gian dài ngoài trời và tay có ra mồ hôi nhưng nhờ lối thiết kế trên nên Find N3 Flip luôn giữ được sự mới mẻ từng có của nó. Khung bao quanh máy được làm từ nhôm cao cấp, mang lại sự sang trọng và đồng thời cải thiện khả năng chống va đập. Bản lề của điện thoại được gia công chắc chắn, đảm bảo mở đóng mượt mà và nhanh chóng bằng hai tay. Cụm camera đã được OPPO đặt gọn vào một cụm tròn ở mặt sau thay vì để dọc xuống như người đàn anh của mình. Điều này tạo nên sự gọn gàng cũng như một cái nhìn mới mẻ cho chiếc điện thoại gập đẹp mắt này. Tuy nhiên, điểm trơn của khung máy có thể khiến việc mở máy bằng một tay trở nên khó khăn, đặc biệt là khi tay ẩm ướt. Bạn không thể thực hiện thao tác mở bằng một tay trên N3 Flip vì bản lề khá khít và có thể ảnh hưởng đến máy sau này. Chính vì thế bạn nên mở bằng hai tay để đảm bảo độ bền cho máy hoặc có thể sử dụng màn hình phụ để cập nhật thông tin nhanh hơn. Dòng Find N3 Flip của OPPO đã hoàn thiện khá tốt về bản lề, nhưng vẫn còn một số nếp gấp nhỏ khiến cho trải nghiệm không hoàn toàn như mong đợi. Mình có dùng máy mở ra ở các chế độ khác nhau dưới 90 độ máy vẫn giữ được độ cứng cáp. Tuy nhiên có một điểm đáng buồn là máy khi mở ra góc khoảng 170 độ thì tự ngã hoàn toàn ra phía sau do phần bản lề ở đây chưa được OPPO tối ưu. Vì thế bạn hãy mở ra hết 180 độ hoặc mở ra các góc nhỏ hơn 90 độ để bảo vệ bản lề của máy được tốt hơn trong quá trình sử dụng. Không thể không nhắc đến một điểm thú vị trên OPPO Find N3 Flip đó là hãng đã trang bị cần gạt âm thanh giúp bạn điều chỉnh được ba chế độ im lặng, rung, chuông giúp bạn có thể tùy chỉnh trong một số trường hợp cần thiết.",
            "title": "Nâng tầm thiết kế, nâng cao phong cách"
        },
        {
            "content": "Nói đến phần hiển thị, điện thoại OPPO này đã trang bị tấm nền AMOLED cho máy. Mình có trải nghiệm video YouTube cũng như xem phim trên máy thì những gì mà nó mang lại là một màu sắc rực rỡ và bắt mắt. Độ tương phản cao làm cho nội dung trở nên hoàn hảo và sống động hơn. Đồng thời nó cũng giảm thiểu ánh sáng xanh, nên khi mình sử dụng thời gian dài mắt mình không có cảm giác mệt mỏi. Với màn hình lớn 6.8 inch, Find N3 Flip mang đến trải nghiệm xem nội dung lớn hơn để cập nhật thông tin nhanh chóng mà còn tạo ra không gian lý tưởng cho việc chơi game. Kích thước lớn khi mình chơi game không ấn nhầm vào phím điều hướng trong game giúp bạn có thể gánh được đồng đội bất cứ lúc nào. Độ phân giải Full HD+ (1080 x 2520 Pixels) trên Find N3 Flip tạo ra hình ảnh rõ nét và chi tiết, loại bỏ hiện tượng răng cưa và lộ rõ điểm ảnh. Màn hình cũng ấn tượng với độ sáng lên đến 1600 nits, cho phép sử dụng máy dễ dàng ngoài trời hoặc trong điều kiện ánh sáng cao. Dưới ánh nắng trực tiếp vào khoảng 11 giờ trưa mình có sử dụng để xem bản đồ thì các biểu tượng vẫn duy trì hiển thị rõ ràng. Mình có thực hiện các thao tác vuốt chạm cơ bản trên Find N3 Flip thì máy thực hiện mượt mà và hiển thị trơn tru không gặp hiện tượng bóng mờ trong quá trình cuộn/lướt nhanh. Nói về màn hình ngoài của máy, với kích thước lớn trong phân khúc điện thoại gập dọc 3.26 inch, không chỉ là điểm nhấn thiết kế mà còn mang lại nhiều tiện ích. Nó cho phép xem trực tiếp thông báo, giờ giấc, thời tiết mà không cần mở máy. Màn hình này cũng hỗ trợ xem trước ảnh chụp khi tự sướng, làm tăng thêm sự thú vị và cải thiện chất lượng ảnh từ camera sau. Màn hình phụ hỗ trợ một số tính năng và bạn có thể sử dụng một số ứng dụng như YouTube, TikTok hoặc chơi game. Mình có thể sử dụng màn hình này để giải trí khi đợi đèn đỏ quá lâu ở những ngã tư tấp nập tại Sài Gòn nhưng bạn nên cẩn thận không bị trộm cướp nhé. Về chất lượng hình ảnh, màn hình phụ của Find N3 Flip, với tấm nền AMOLED và độ phân giải 720 x 382 Pixels, tạo ra màu sắc rực rỡ và chi tiết tốt, cùng với đó độ sáng 900 nits đem đến khả năng hiển thị tốt khi mình sử dụng ngoài trời.",
            "title": "Hiển thị rực rỡ mọi chi tiết"
        },
        {
            "content": "Được trang bị bộ vi xử lý MediaTek Dimensity 9200 5G, Find N3 Flip thực sự là một điện thoại với hiệu năng mạnh mẽ. Với tiến trình sản xuất 4 nm và 8 nhân hoạt động lên đến 3.05 GHz, con chip này có khả năng cạnh tranh với các đối thủ đình đám như Snapdragon 8 Gen 2 của Qualcomm. Trải qua những hoạt động hàng ngày, mình cảm thấy Find N3 Flip mang lại trải nghiệm sử dụng mượt mà và nhanh chóng. Từ việc lướt web đến xem phim, chụp ảnh và quay video, điện thoại này không chỉ tránh được hiện tượng giật lag mà còn đảm bảo khả năng load ứng dụng nhanh chóng, tạo ra một trải nghiệm người dùng liền mạch và thú vị. Khả năng chơi game trên Find N3 Flip mang đến một trải nghiệm tuyệt vời, đặc biệt với các tựa game đồ họa cao. Với hiệu suất mạnh mẽ, điện thoại này xử lý mượt mà mọi tình huống, từ Liên Quân Mobile đến PUBG Mobile ở cấu hình tối đa. Khả năng duy trì tốc độ khung hình ổn định và không có biến động đáng kể trên biểu đồ FPS tạo ra một trải nghiệm chơi game không giới hạn, không gặp khó khăn nào. Khi chơi game một thời gian mình cảm nhận nhiệt độ trên máy duy trì sự mát mẻ ngay cả trong các phiên chơi game liên tục. Dù gặp ít lần tình huống nóng lên, như khi sử dụng mạng di động ngoài trời, máy nhanh chóng ổn định khi chuyển đến môi trường mát mẻ hơn. Điều này giúp Find N3 Flip không chỉ đáp ứng tốt với các tác vụ đòi hỏi hiệu suất cao mà còn mang lại trải nghiệm người dùng ổn định và thoải mái. Với mẫu điện thoại RAM 12 GB này Find N3 Flip đã linh hoạt xử lý tác vụ đa nhiệm một cách dễ dàng. Thao tác chuyển đổi giữa các ứng dụng diễn ra mượt mà và không gặp trở ngại. Mình đã thử mở đồng thời 15 ứng dụng đồng thời và kiểm tra lại sau thời gian dài, điện thoại vẫn duy trì hiệu suất ổn định, các ứng dụng không gặp hiện tượng load lại mang đến lại sự tối ưu trong quá trình sử dụng",
            "title": "Hiệu năng mạnh mẽ mang lại trải nghiệm tối ưu"
        },
        {
            "content": "Find N3 Flip sở hữu một hệ thống camera đỉnh cao trong phân khúc của mình. Mặc dù không phải là điện thoại chuyên nghiệp về chụp ảnh, nhưng OPPO vẫn chăm chút khi trang bị nhiều công nghệ tiên tiến, bao gồm chip xử lý hình ảnh MariSilicon X và hợp tác cùng Hasselblad để tối ưu hóa camera. Với cấu hình cơ bản, hệ thống camera sau bao gồm bộ đôi camera 50 MP và hai camera phụ 48 MP và 32 MP, đi kèm với nhiều tính năng và chế độ chụp như AI camera, chế độ chuyên nghiệp (Pro), siêu độ phân giải, và zoom quang học. Trong điều kiện đủ ánh sáng, ảnh chụp từ Find N3 Flip thể hiện độ chi tiết cao, màu sắc rực rỡ và sinh động. Không bị ám màu hay mất đi sự trong trẻo, bức ảnh tạo cảm giác tự nhiên và sống động. Đối với các gam màu nóng, Find N3 Flip thường nâng tone nhẹ, tạo nên bức ảnh đẹp mắt và cuốn hút hơn, đặc biệt khi sử dụng tính năng AI Camera. Khả năng chụp ảnh tele thông qua zoom quang học giữ được độ chi tiết, mặc dù không thể sánh kịp với camera chính nhưng vẫn mang lại cảm giác chân thực và sắc nét. Tuy nhiên, có một thay đổi rõ rệt và hạn chế đôi khi bạn chụp trong môi trường thiếu ánh sáng, ví dụ như tấm hình dưới đây mình chụp vào buổi chiều và có mây khá nhiều. Vì thế ảnh chụp có vẻ thiếu sức sống, màu sắc nhợt nhạt, đòi hỏi phải có bước xử lý hậu kỳ để làm cho nó trở nên sống động và nghệ thuật hơn. Với camera góc rộng, Find N3 Flip cung cấp khả năng quan sát rộng lớn, hình ảnh tái tạo không bị móp méo cũng như màu sắc đẹp mắt. Chế độ này đặc biệt phù hợp cho việc chụp cảnh rộng có độ bao quát lớn và ảnh nhóm. Ngoài ra máy cũng hỗ trợ nhiều bộ lọc màu giúp bạn có thể tùy chọn và chụp được những bức ảnh hết sức nghệ thuật. Những bộ lọc này rất đa dạng và bạn chỉ cần chọn một màu sắc mình thích và chụp, công việc còn lại hệ thống OPPO sẽ giúp bạn xử lý một cách nhanh chóng.",
            "title": "Trải nghiệm chụp ảnh thú vị"
        },
        {
            "content": "OPPO Find N3 Flip là một smartphone màn hình gập độc đáo từ OPPO, và một trong những điểm đáng chú ý của sản phẩm là thời lượng pin ấn tượng. Sau một thời gian dài trải nghiệm, mình thực sự ấn tượng với hiệu suất pin của chiếc điện thoại này. Với dung lượng pin lên đến 4300 mAh, điện thoại OPPO Find N này đáp ứng mọi nhu cầu sử dụng một cách xuất sắc. Thời lượng pin kéo dài suốt một ngày là điều bình thường. Mình có thể thoải mái lướt web, xem video, chơi game và thực hiện các tác vụ hàng ngày trong khoảng 7 tiếng mà không cần lo lắng về việc sạc pin. Hơn nữa, OPPO Find N3 Flip được trang bị công nghệ sạc siêu nhanh SuperVOOC. Điều này có nghĩa là chỉ cần một thời gian ngắn, pin của điện thoại có thể được sạc đầy để sẵn sàng sử dụng. Chỉ cần khoảng một tiếng là đủ để nạp đầy dung lượng từ 0% lên đến 100%. OPPO Find N3 Flip, một chiếc điện thoại gập hiện đại, hiện đang được coi là một đối thủ đáng gờm trên thị trường hiện nay. Với thiết kế màn hình đẹp và sức mạnh của con chip hiệu năng cao, nó đáp ứng nhiều mục đích sử dụng, bao gồm chụp ảnh, quay phim và chơi game.",
            "title": "Viên pin lớn sử dụng dài lâu"
        }
    ],
    "promotions": [
        "Khuyến mãi",
        "Giá và khuyến mãi dự kiến áp dụng đến 23:59 | 09/03",
        "Tặng gói dịch vụ bảo hành cao cấp - OPPO Premium Service Xem chi tiết",
        "Phiếu mua hàng trị giá 1,000,000đ mua tablet (trừ Ipad) có giá niêm yết từ 10,000,000đ",
        "Tặng Phiếu mua hàng mua đơn hàng từ 250,000đ các sản phẩm miếng dán kính, cáp, sạc, sạc dự phòng, ốp lưng, loa di động, loa vi tính và đồng hồ trị giá 50,000đ.",
        "Phiếu mua hàng áp dụng mua tất cả sim có gói Mobi, Itel, Local, Vina và VNMB trị giá 50,000đ. (Xem chi tiết tại đây)",
        "Nhập mã VNPAYTGDD1 giảm từ 40,000đ đến 150,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR. (Xem chi tiết tại đây)",
        "Thu cũ Đổi mới: Giảm đến 2,000,000đ (Không kèm ưu đãi thanh toán qua cổng, mua kèm) Xem chi tiết"
    ],
    "release": "10/2023",
    "original_prices": [
        "22.990.000₫",
        "22.990.000₫"
    ],
    "current_prices": [
        "16.990.000₫",
        "16.990.000₫"
    ],
    "specifications": [
        {
            "name": "Hệ điều hành",
            "value": "Android 13"
        },
        {
            "name": "Vi xử lý",
            "value": "MediaTek Dimensity 9200 5G 8 nhân"
        },
        {
            "name": "Tốc độ chip",
            "value": "1 nhân 3.05 GHz, 3 nhân 2.85 GHz & 4 nhân 1.8 GHz"
        },
        {
            "name": "Chip đồ họa",
            "value": "Immortalis-G715 MC11"
        },
        {
            "name": "RAM",
            "value": "12 GB"
        },
        {
            "name": "Dung lượng",
            "value": "256 GB"
        },
        {
            "name": "Dung lượng khả dụng",
            "value": "239 GB"
        },
        {
            "name": "Danh bạ",
            "value": "Không giới hạn"
        },
        {
            "name": "Độ phân giải camera sau",
            "value": "Chính 50 MP & Phụ 48 MP, 32 MP"
        },
        {
            "name": "Quay phim camera sau",
            "value": [
                "HD 720p@60fps",
                "HD 720p@480fps",
                "HD 720p@30fps",
                "FullHD 1080p@60fps",
                "FullHD 1080p@30fps",
                "FullHD 1080p@240fps",
                "4K 2160p@30fps"
            ]
        },
        {
            "name": "Đèn flash",
            "value": "Có"
        },
        {
            "name": "Tính năng camera sau",
            "value": [
                "Ảnh Raw",
                "Zoom quang học",
                "Zoom kỹ thuật số",
                "Xóa phông",
                "Tự động lấy nét (AF)",
                "Trôi nhanh thời gian (Time Lapse)",
                "Toàn cảnh (Panorama)",
                "Siêu độ phân giải",
                "Quét tài liệu",
                "Quét mã QR",
                "Quay chậm (Slow Motion)",
                "Phơi sáng",
                "Nhãn dán (AR Stickers)",
                "Làm đẹp",
                "HDR",
                "Góc siêu rộng (Ultrawide)",
                "Google Lens",
                "Chụp hẹn giờ",
                "Chống rung quang học (OIS)",
                "Chuyên nghiệp (Pro)",
                "Bộ lọc màu",
                "Ban đêm (Night Mode)"
            ]
        },
        {
            "name": "Độ phân giải camera trước",
            "value": "32 MP"
        },
        {
            "name": "Tính năng camera trước",
            "value": [
                "Xóa phông",
                "Trôi nhanh thời gian (Time Lapse)",
                "Toàn cảnh (Panorama)",
                "Quay video HD",
                "Quay video Full HD",
                "Quay video 4K",
                "Nhãn dán (AR Stickers)",
                "Làm đẹp",
                "HDR",
                "Góc rộng (Wide)",
                "Chụp đêm",
                "Chống rung",
                "Bộ lọc màu"
            ]
        },
        {
            "name": "Công nghệ màn hình",
            "value": "AMOLED"
        },
        {
            "name": "Độ phân giải màn hình",
            "value": "Chính: FHD+ (1080 x 2520 Pixels) & Phụ: SD (382 x 720 Pixels)"
        },
        {
            "name": "Màn hình rộng",
            "value": "Chính 6.8\" & Phụ 3.26\" - Tần số quét Chính: 120 Hz & Phụ: 60 Hz"
        },
        {
            "name": "Độ sáng tối đa",
            "value": "Chính 1600 nits & Phụ 900 nits"
        },
        {
            "name": "Mặt kính cảm ứng",
            "value": "Chính: Kính siêu mỏng Schott UTG & Phụ: Corning Gorilla Glass 7"
        },
        {
            "name": "Dung lượng pin",
            "value": "4300 mAh"
        },
        {
            "name": "Loại pin",
            "value": "Li-Po"
        },
        {
            "name": "Hỗ trợ sạc tối đa",
            "value": "44 W"
        },
        {
            "name": "Công nghệ pin",
            "value": [
                "Tiết kiệm pin",
                "Sạc siêu nhanh SuperVOOC",
                "Siêu tiết kiệm pin"
            ]
        },
        {
            "name": "Bảo mật nâng cao",
            "value": [
                "Mở khoá vân tay cạnh viền",
                "Mở khoá khuôn mặt"
            ]
        },
        {
            "name": "Tính năng đặc biệt",
            "value": [
                "Ứng dụng kép (Nhân bản ứng dụng)",
                "Đa cửa sổ (chia đôi màn hình)",
                "Âm thanh Dolby Atmos",
                "Trợ lý ảo Google Assistant",
                "Thu nhỏ màn hình sử dụng một tay",
                "Mở rộng bộ nhớ RAM",
                "Khoá ứng dụng",
                "HDR10+",
                "DCI-P3",
                "Cử chỉ màn hình tắt",
                "Chế độ trẻ em (Không gian trẻ em)",
                "Chạm 2 lần tắt/sáng màn hình"
            ]
        },
        {
            "name": "Kháng nước, bụi",
            "value": "IPX4"
        },
        {
            "name": "Ghi âm",
            "value": [
                "Ghi âm mặc định",
                "Ghi âm cuộc gọi"
            ]
        },
        {
            "name": "Xem phim",
            "value": [
                "MP4",
                "AV1",
                "3GP"
            ]
        },
        {
            "name": "Nghe nhạc",
            "value": [
                "OGG",
                "MP3",
                "Midi",
                "FLAC"
            ]
        },
        {
            "name": "Mạng di động",
            "value": "Hỗ trợ 5G"
        },
        {
            "name": "SIM",
            "value": "2 Nano SIM"
        },
        {
            "name": "WiFi",
            "value": [
                "Wi-Fi hotspot",
                "Wi-Fi Direct",
                "Wi-Fi 802.11 a/b/g/n/ac/ax",
                "Wi-Fi 6",
                "Dual-band (2.4 GHz/5 GHz)"
            ]
        },
        {
            "name": "GPS",
            "value": [
                "QZSS",
                "GPS",
                "GLONASS",
                "GALILEO",
                "BEIDOU"
            ]
        },
        {
            "name": "Bluetooth",
            "value": [
                "v5.3"
            ]
        },
        {
            "name": "Jack tai nghe",
            "value": "Type-C"
        },
        {
            "name": "Kết nối khác",
            "value": [
                "OTG",
                "NFC"
            ]
        },
        {
            "name": "Kiểu thiết kế",
            "value": "Nguyên khối"
        },
        {
            "name": "Chất liệu",
            "value": "Khung nhôm & Mặt lưng kính cường lực Gorilla Glass 7"
        },
        {
            "name": "Kích thước, khối lượng",
            "value": "Dài 166.42 mm - Ngang 75.78 mm - Dày 7.79 mm - Nặng 198 g"
        }
    ],
    "colors": [
        "Đen",
        "Vàng đồng"
    ],
    "quantities": [
        25,
        22
    ],
    "variants": [],
    "productNames": [
        "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng",
        "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng"
    ]
}
]

const products1 = [
    {
        "productId": "67cff271b6dd012f66cbba01",
        "productName": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng",
        "description": "",
        "brand": "OPPO",
        "images": {
            "Đen": [
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Slider/oppo-find-n3-flip638334082319616358.jpg",
                    "title": ""
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-1-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-2-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-3-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-4-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-5-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-6-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-7-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-8-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-9-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-10-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-11-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-12-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-13-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-14-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-den-glr-15-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Đen"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Kit/oppo-find-n3-flip-phu-kien-org.jpg",
                    "title": "Bộ sản phẩm gồm: Ốp lưng, Sách hướng dẫn, Hộp, Cáp Type C, Củ sạc nhanh rời đầu Type A, Cây lấy sim"
                }
            ],
            "Vàng đồng": [
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Slider/oppo-find-n3-flip638334082319616358.jpg",
                    "title": ""
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-1-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-2-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-3-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-4-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-5-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-6-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-7-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-8-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-9-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-10-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-11-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-12-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-13-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-14-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-15-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/oppo-n3-flip-vang-16-180x125.jpg",
                    "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng Màu Vàng đồng"
                },
                {
                    "url": "https://cdn.tgdd.vn/Products/Images/42/309835/Kit/oppo-find-n3-flip-phu-kien-org.jpg",
                    "title": "Bộ sản phẩm gồm: Ốp lưng, Sách hướng dẫn, Hộp, Cáp Type C, Củ sạc nhanh rời đầu Type A, Cây lấy sim"
                }
            ]
        },
        "type": "PHONE",
        "warrantyPeriod": null,
        "productReviews": [
            {
                "content": "Là điện thoại gập dọc thế hệ tiếp theo của OPPO, Find N3 Flip kế thừa cũng như cải tiến về thiết kế trên phiên bản cũ. Điều này làm cho trải nghiệm sử dụng trở nên thú vị hơn so với các sản phẩm thông thường. Về tổng quan về ngoại hình, máy có kích thước khá dài và thanh mảnh, khi mở hoàn toàn, Find N3 Flip đạt đến 166.42 mm, nhưng khi mình gập lại, kích thước giảm xuống chỉ còn 85.54 mm. Việc này giúp cho máy trở nên nhỏ gọn và dễ cầm nắm hơn, đặc biệt là khi bỏ vào túi quần mà không gặp khó khăn hay gây phiền toái khi ngồi lái xe hoặc làm việc. Mặt lưng của Find N3 Flip được làm từ kính cường lực, hoàn thiện vô cùng tỉ mỉ, tạo nên vẻ đẹp mắt và cảm giác sờ chạm dễ chịu. Khả năng chống bám vân tay hiệu quả giúp giữ cho máy luôn sạch sẽ và dễ vệ sinh. Mình đã dùng máy một thời gian dài ngoài trời và tay có ra mồ hôi nhưng nhờ lối thiết kế trên nên Find N3 Flip luôn giữ được sự mới mẻ từng có của nó. Khung bao quanh máy được làm từ nhôm cao cấp, mang lại sự sang trọng và đồng thời cải thiện khả năng chống va đập. Bản lề của điện thoại được gia công chắc chắn, đảm bảo mở đóng mượt mà và nhanh chóng bằng hai tay. Cụm camera đã được OPPO đặt gọn vào một cụm tròn ở mặt sau thay vì để dọc xuống như người đàn anh của mình. Điều này tạo nên sự gọn gàng cũng như một cái nhìn mới mẻ cho chiếc điện thoại gập đẹp mắt này. Tuy nhiên, điểm trơn của khung máy có thể khiến việc mở máy bằng một tay trở nên khó khăn, đặc biệt là khi tay ẩm ướt. Bạn không thể thực hiện thao tác mở bằng một tay trên N3 Flip vì bản lề khá khít và có thể ảnh hưởng đến máy sau này. Chính vì thế bạn nên mở bằng hai tay để đảm bảo độ bền cho máy hoặc có thể sử dụng màn hình phụ để cập nhật thông tin nhanh hơn. Dòng Find N3 Flip của OPPO đã hoàn thiện khá tốt về bản lề, nhưng vẫn còn một số nếp gấp nhỏ khiến cho trải nghiệm không hoàn toàn như mong đợi. Mình có dùng máy mở ra ở các chế độ khác nhau dưới 90 độ máy vẫn giữ được độ cứng cáp. Tuy nhiên có một điểm đáng buồn là máy khi mở ra góc khoảng 170 độ thì tự ngã hoàn toàn ra phía sau do phần bản lề ở đây chưa được OPPO tối ưu. Vì thế bạn hãy mở ra hết 180 độ hoặc mở ra các góc nhỏ hơn 90 độ để bảo vệ bản lề của máy được tốt hơn trong quá trình sử dụng. Không thể không nhắc đến một điểm thú vị trên OPPO Find N3 Flip đó là hãng đã trang bị cần gạt âm thanh giúp bạn điều chỉnh được ba chế độ im lặng, rung, chuông giúp bạn có thể tùy chỉnh trong một số trường hợp cần thiết.",
                "title": "Nâng tầm thiết kế, nâng cao phong cách"
            },
            {
                "content": "Nói đến phần hiển thị, điện thoại OPPO này đã trang bị tấm nền AMOLED cho máy. Mình có trải nghiệm video YouTube cũng như xem phim trên máy thì những gì mà nó mang lại là một màu sắc rực rỡ và bắt mắt. Độ tương phản cao làm cho nội dung trở nên hoàn hảo và sống động hơn. Đồng thời nó cũng giảm thiểu ánh sáng xanh, nên khi mình sử dụng thời gian dài mắt mình không có cảm giác mệt mỏi. Với màn hình lớn 6.8 inch, Find N3 Flip mang đến trải nghiệm xem nội dung lớn hơn để cập nhật thông tin nhanh chóng mà còn tạo ra không gian lý tưởng cho việc chơi game. Kích thước lớn khi mình chơi game không ấn nhầm vào phím điều hướng trong game giúp bạn có thể gánh được đồng đội bất cứ lúc nào. Độ phân giải Full HD+ (1080 x 2520 Pixels) trên Find N3 Flip tạo ra hình ảnh rõ nét và chi tiết, loại bỏ hiện tượng răng cưa và lộ rõ điểm ảnh. Màn hình cũng ấn tượng với độ sáng lên đến 1600 nits, cho phép sử dụng máy dễ dàng ngoài trời hoặc trong điều kiện ánh sáng cao. Dưới ánh nắng trực tiếp vào khoảng 11 giờ trưa mình có sử dụng để xem bản đồ thì các biểu tượng vẫn duy trì hiển thị rõ ràng. Mình có thực hiện các thao tác vuốt chạm cơ bản trên Find N3 Flip thì máy thực hiện mượt mà và hiển thị trơn tru không gặp hiện tượng bóng mờ trong quá trình cuộn/lướt nhanh. Nói về màn hình ngoài của máy, với kích thước lớn trong phân khúc điện thoại gập dọc 3.26 inch, không chỉ là điểm nhấn thiết kế mà còn mang lại nhiều tiện ích. Nó cho phép xem trực tiếp thông báo, giờ giấc, thời tiết mà không cần mở máy. Màn hình này cũng hỗ trợ xem trước ảnh chụp khi tự sướng, làm tăng thêm sự thú vị và cải thiện chất lượng ảnh từ camera sau. Màn hình phụ hỗ trợ một số tính năng và bạn có thể sử dụng một số ứng dụng như YouTube, TikTok hoặc chơi game. Mình có thể sử dụng màn hình này để giải trí khi đợi đèn đỏ quá lâu ở những ngã tư tấp nập tại Sài Gòn nhưng bạn nên cẩn thận không bị trộm cướp nhé. Về chất lượng hình ảnh, màn hình phụ của Find N3 Flip, với tấm nền AMOLED và độ phân giải 720 x 382 Pixels, tạo ra màu sắc rực rỡ và chi tiết tốt, cùng với đó độ sáng 900 nits đem đến khả năng hiển thị tốt khi mình sử dụng ngoài trời.",
                "title": "Hiển thị rực rỡ mọi chi tiết"
            },
            {
                "content": "Được trang bị bộ vi xử lý MediaTek Dimensity 9200 5G, Find N3 Flip thực sự là một điện thoại với hiệu năng mạnh mẽ. Với tiến trình sản xuất 4 nm và 8 nhân hoạt động lên đến 3.05 GHz, con chip này có khả năng cạnh tranh với các đối thủ đình đám như Snapdragon 8 Gen 2 của Qualcomm. Trải qua những hoạt động hàng ngày, mình cảm thấy Find N3 Flip mang lại trải nghiệm sử dụng mượt mà và nhanh chóng. Từ việc lướt web đến xem phim, chụp ảnh và quay video, điện thoại này không chỉ tránh được hiện tượng giật lag mà còn đảm bảo khả năng load ứng dụng nhanh chóng, tạo ra một trải nghiệm người dùng liền mạch và thú vị. Khả năng chơi game trên Find N3 Flip mang đến một trải nghiệm tuyệt vời, đặc biệt với các tựa game đồ họa cao. Với hiệu suất mạnh mẽ, điện thoại này xử lý mượt mà mọi tình huống, từ Liên Quân Mobile đến PUBG Mobile ở cấu hình tối đa. Khả năng duy trì tốc độ khung hình ổn định và không có biến động đáng kể trên biểu đồ FPS tạo ra một trải nghiệm chơi game không giới hạn, không gặp khó khăn nào. Khi chơi game một thời gian mình cảm nhận nhiệt độ trên máy duy trì sự mát mẻ ngay cả trong các phiên chơi game liên tục. Dù gặp ít lần tình huống nóng lên, như khi sử dụng mạng di động ngoài trời, máy nhanh chóng ổn định khi chuyển đến môi trường mát mẻ hơn. Điều này giúp Find N3 Flip không chỉ đáp ứng tốt với các tác vụ đòi hỏi hiệu suất cao mà còn mang lại trải nghiệm người dùng ổn định và thoải mái. Với mẫu điện thoại RAM 12 GB này Find N3 Flip đã linh hoạt xử lý tác vụ đa nhiệm một cách dễ dàng. Thao tác chuyển đổi giữa các ứng dụng diễn ra mượt mà và không gặp trở ngại. Mình đã thử mở đồng thời 15 ứng dụng đồng thời và kiểm tra lại sau thời gian dài, điện thoại vẫn duy trì hiệu suất ổn định, các ứng dụng không gặp hiện tượng load lại mang đến lại sự tối ưu trong quá trình sử dụng",
                "title": "Hiệu năng mạnh mẽ mang lại trải nghiệm tối ưu"
            },
            {
                "content": "Find N3 Flip sở hữu một hệ thống camera đỉnh cao trong phân khúc của mình. Mặc dù không phải là điện thoại chuyên nghiệp về chụp ảnh, nhưng OPPO vẫn chăm chút khi trang bị nhiều công nghệ tiên tiến, bao gồm chip xử lý hình ảnh MariSilicon X và hợp tác cùng Hasselblad để tối ưu hóa camera. Với cấu hình cơ bản, hệ thống camera sau bao gồm bộ đôi camera 50 MP và hai camera phụ 48 MP và 32 MP, đi kèm với nhiều tính năng và chế độ chụp như AI camera, chế độ chuyên nghiệp (Pro), siêu độ phân giải, và zoom quang học. Trong điều kiện đủ ánh sáng, ảnh chụp từ Find N3 Flip thể hiện độ chi tiết cao, màu sắc rực rỡ và sinh động. Không bị ám màu hay mất đi sự trong trẻo, bức ảnh tạo cảm giác tự nhiên và sống động. Đối với các gam màu nóng, Find N3 Flip thường nâng tone nhẹ, tạo nên bức ảnh đẹp mắt và cuốn hút hơn, đặc biệt khi sử dụng tính năng AI Camera. Khả năng chụp ảnh tele thông qua zoom quang học giữ được độ chi tiết, mặc dù không thể sánh kịp với camera chính nhưng vẫn mang lại cảm giác chân thực và sắc nét. Tuy nhiên, có một thay đổi rõ rệt và hạn chế đôi khi bạn chụp trong môi trường thiếu ánh sáng, ví dụ như tấm hình dưới đây mình chụp vào buổi chiều và có mây khá nhiều. Vì thế ảnh chụp có vẻ thiếu sức sống, màu sắc nhợt nhạt, đòi hỏi phải có bước xử lý hậu kỳ để làm cho nó trở nên sống động và nghệ thuật hơn. Với camera góc rộng, Find N3 Flip cung cấp khả năng quan sát rộng lớn, hình ảnh tái tạo không bị móp méo cũng như màu sắc đẹp mắt. Chế độ này đặc biệt phù hợp cho việc chụp cảnh rộng có độ bao quát lớn và ảnh nhóm. Ngoài ra máy cũng hỗ trợ nhiều bộ lọc màu giúp bạn có thể tùy chọn và chụp được những bức ảnh hết sức nghệ thuật. Những bộ lọc này rất đa dạng và bạn chỉ cần chọn một màu sắc mình thích và chụp, công việc còn lại hệ thống OPPO sẽ giúp bạn xử lý một cách nhanh chóng.",
                "title": "Trải nghiệm chụp ảnh thú vị"
            },
            {
                "content": "OPPO Find N3 Flip là một smartphone màn hình gập độc đáo từ OPPO, và một trong những điểm đáng chú ý của sản phẩm là thời lượng pin ấn tượng. Sau một thời gian dài trải nghiệm, mình thực sự ấn tượng với hiệu suất pin của chiếc điện thoại này. Với dung lượng pin lên đến 4300 mAh, điện thoại OPPO Find N này đáp ứng mọi nhu cầu sử dụng một cách xuất sắc. Thời lượng pin kéo dài suốt một ngày là điều bình thường. Mình có thể thoải mái lướt web, xem video, chơi game và thực hiện các tác vụ hàng ngày trong khoảng 7 tiếng mà không cần lo lắng về việc sạc pin. Hơn nữa, OPPO Find N3 Flip được trang bị công nghệ sạc siêu nhanh SuperVOOC. Điều này có nghĩa là chỉ cần một thời gian ngắn, pin của điện thoại có thể được sạc đầy để sẵn sàng sử dụng. Chỉ cần khoảng một tiếng là đủ để nạp đầy dung lượng từ 0% lên đến 100%. OPPO Find N3 Flip, một chiếc điện thoại gập hiện đại, hiện đang được coi là một đối thủ đáng gờm trên thị trường hiện nay. Với thiết kế màn hình đẹp và sức mạnh của con chip hiệu năng cao, nó đáp ứng nhiều mục đích sử dụng, bao gồm chụp ảnh, quay phim và chơi game.",
                "title": "Viên pin lớn sử dụng dài lâu"
            }
        ],
        "promotions": [
            "Khuyến mãi",
            "Giá và khuyến mãi dự kiến áp dụng đến 23:59 | 09/03",
            "Tặng gói dịch vụ bảo hành cao cấp - OPPO Premium Service Xem chi tiết",
            "Phiếu mua hàng trị giá 1,000,000đ mua tablet (trừ Ipad) có giá niêm yết từ 10,000,000đ",
            "Tặng Phiếu mua hàng mua đơn hàng từ 250,000đ các sản phẩm miếng dán kính, cáp, sạc, sạc dự phòng, ốp lưng, loa di động, loa vi tính và đồng hồ trị giá 50,000đ.",
            "Phiếu mua hàng áp dụng mua tất cả sim có gói Mobi, Itel, Local, Vina và VNMB trị giá 50,000đ. (Xem chi tiết tại đây)",
            "Nhập mã VNPAYTGDD1 giảm từ 40,000đ đến 150,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR. (Xem chi tiết tại đây)",
            "Thu cũ Đổi mới: Giảm đến 2,000,000đ (Không kèm ưu đãi thanh toán qua cổng, mua kèm) Xem chi tiết"
        ],
        "release": "10/2023",
        "original_prices": [
            "22.990.000₫",
            "22.990.000₫"
        ],
        "current_prices": [
            "16.990.000₫",
            "16.990.000₫"
        ],
        "specifications": [
            {
                "name": "Hệ điều hành",
                "value": "Android 13"
            },
            {
                "name": "Vi xử lý",
                "value": "MediaTek Dimensity 9200 5G 8 nhân"
            },
            {
                "name": "Tốc độ chip",
                "value": "1 nhân 3.05 GHz, 3 nhân 2.85 GHz & 4 nhân 1.8 GHz"
            },
            {
                "name": "Chip đồ họa",
                "value": "Immortalis-G715 MC11"
            },
            {
                "name": "RAM",
                "value": "12 GB"
            },
            {
                "name": "Dung lượng",
                "value": "256 GB"
            },
            {
                "name": "Dung lượng khả dụng",
                "value": "239 GB"
            },
            {
                "name": "Danh bạ",
                "value": "Không giới hạn"
            },
            {
                "name": "Độ phân giải camera sau",
                "value": "Chính 50 MP & Phụ 48 MP, 32 MP"
            },
            {
                "name": "Quay phim camera sau",
                "value": [
                    "HD 720p@60fps",
                    "HD 720p@480fps",
                    "HD 720p@30fps",
                    "FullHD 1080p@60fps",
                    "FullHD 1080p@30fps",
                    "FullHD 1080p@240fps",
                    "4K 2160p@30fps"
                ]
            },
            {
                "name": "Đèn flash",
                "value": "Có"
            },
            {
                "name": "Tính năng camera sau",
                "value": [
                    "Ảnh Raw",
                    "Zoom quang học",
                    "Zoom kỹ thuật số",
                    "Xóa phông",
                    "Tự động lấy nét (AF)",
                    "Trôi nhanh thời gian (Time Lapse)",
                    "Toàn cảnh (Panorama)",
                    "Siêu độ phân giải",
                    "Quét tài liệu",
                    "Quét mã QR",
                    "Quay chậm (Slow Motion)",
                    "Phơi sáng",
                    "Nhãn dán (AR Stickers)",
                    "Làm đẹp",
                    "HDR",
                    "Góc siêu rộng (Ultrawide)",
                    "Google Lens",
                    "Chụp hẹn giờ",
                    "Chống rung quang học (OIS)",
                    "Chuyên nghiệp (Pro)",
                    "Bộ lọc màu",
                    "Ban đêm (Night Mode)"
                ]
            },
            {
                "name": "Độ phân giải camera trước",
                "value": "32 MP"
            },
            {
                "name": "Tính năng camera trước",
                "value": [
                    "Xóa phông",
                    "Trôi nhanh thời gian (Time Lapse)",
                    "Toàn cảnh (Panorama)",
                    "Quay video HD",
                    "Quay video Full HD",
                    "Quay video 4K",
                    "Nhãn dán (AR Stickers)",
                    "Làm đẹp",
                    "HDR",
                    "Góc rộng (Wide)",
                    "Chụp đêm",
                    "Chống rung",
                    "Bộ lọc màu"
                ]
            },
            {
                "name": "Công nghệ màn hình",
                "value": "AMOLED"
            },
            {
                "name": "Độ phân giải màn hình",
                "value": "Chính: FHD+ (1080 x 2520 Pixels) & Phụ: SD (382 x 720 Pixels)"
            },
            {
                "name": "Màn hình rộng",
                "value": "Chính 6.8\" & Phụ 3.26\" - Tần số quét Chính: 120 Hz & Phụ: 60 Hz"
            },
            {
                "name": "Độ sáng tối đa",
                "value": "Chính 1600 nits & Phụ 900 nits"
            },
            {
                "name": "Mặt kính cảm ứng",
                "value": "Chính: Kính siêu mỏng Schott UTG & Phụ: Corning Gorilla Glass 7"
            },
            {
                "name": "Dung lượng pin",
                "value": "4300 mAh"
            },
            {
                "name": "Loại pin",
                "value": "Li-Po"
            },
            {
                "name": "Hỗ trợ sạc tối đa",
                "value": "44 W"
            },
            {
                "name": "Công nghệ pin",
                "value": [
                    "Tiết kiệm pin",
                    "Sạc siêu nhanh SuperVOOC",
                    "Siêu tiết kiệm pin"
                ]
            },
            {
                "name": "Bảo mật nâng cao",
                "value": [
                    "Mở khoá vân tay cạnh viền",
                    "Mở khoá khuôn mặt"
                ]
            },
            {
                "name": "Tính năng đặc biệt",
                "value": [
                    "Ứng dụng kép (Nhân bản ứng dụng)",
                    "Đa cửa sổ (chia đôi màn hình)",
                    "Âm thanh Dolby Atmos",
                    "Trợ lý ảo Google Assistant",
                    "Thu nhỏ màn hình sử dụng một tay",
                    "Mở rộng bộ nhớ RAM",
                    "Khoá ứng dụng",
                    "HDR10+",
                    "DCI-P3",
                    "Cử chỉ màn hình tắt",
                    "Chế độ trẻ em (Không gian trẻ em)",
                    "Chạm 2 lần tắt/sáng màn hình"
                ]
            },
            {
                "name": "Kháng nước, bụi",
                "value": "IPX4"
            },
            {
                "name": "Ghi âm",
                "value": [
                    "Ghi âm mặc định",
                    "Ghi âm cuộc gọi"
                ]
            },
            {
                "name": "Xem phim",
                "value": [
                    "MP4",
                    "AV1",
                    "3GP"
                ]
            },
            {
                "name": "Nghe nhạc",
                "value": [
                    "OGG",
                    "MP3",
                    "Midi",
                    "FLAC"
                ]
            },
            {
                "name": "Mạng di động",
                "value": "Hỗ trợ 5G"
            },
            {
                "name": "SIM",
                "value": "2 Nano SIM"
            },
            {
                "name": "WiFi",
                "value": [
                    "Wi-Fi hotspot",
                    "Wi-Fi Direct",
                    "Wi-Fi 802.11 a/b/g/n/ac/ax",
                    "Wi-Fi 6",
                    "Dual-band (2.4 GHz/5 GHz)"
                ]
            },
            {
                "name": "GPS",
                "value": [
                    "QZSS",
                    "GPS",
                    "GLONASS",
                    "GALILEO",
                    "BEIDOU"
                ]
            },
            {
                "name": "Bluetooth",
                "value": [
                    "v5.3"
                ]
            },
            {
                "name": "Jack tai nghe",
                "value": "Type-C"
            },
            {
                "name": "Kết nối khác",
                "value": [
                    "OTG",
                    "NFC"
                ]
            },
            {
                "name": "Kiểu thiết kế",
                "value": "Nguyên khối"
            },
            {
                "name": "Chất liệu",
                "value": "Khung nhôm & Mặt lưng kính cường lực Gorilla Glass 7"
            },
            {
                "name": "Kích thước, khối lượng",
                "value": "Dài 166.42 mm - Ngang 75.78 mm - Dày 7.79 mm - Nặng 198 g"
            }
        ],
        "colors": [
            "Đen",
            "Vàng đồng"
        ],
        "quantities": [
            25,
            22
        ],
        "variants": [],
        "productNames": [
            "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng",
            "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Đen/Vàng đồng"
        ]
    }
]


const fetchProductByName = (id:string) => {
  return products1.find((p) => p.productId === id);
};

export default ProductGH;