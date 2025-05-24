package com.eazybytes.vnpay.common.utils;


import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*; 
import java.net.URLEncoder;

public class VnPayHelper {

    public static String generateDate(boolean forExpire) {

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        if (forExpire == false) {

            return formatter.format(cld.getTime());
        }

        cld.add(Calendar.MINUTE, 10); // Đổi từ 15 phút thành 10 phút
        return formatter.format(cld.getTime());
    }

    public static String md5(String message) {

        String digest = null;
        try {

            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(message.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {

                sb.append(String.format("%02x", b & 0xff));
            }
            digest = sb.toString();
        } catch (UnsupportedEncodingException ex) {

            digest = "";
        } catch (NoSuchAlgorithmException ex) {

            digest = "";
        }

        return digest;

    }

    public static String Sha256(String message) {

        String digest = null;
        try {

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(message.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {

                sb.append(String.format("%02x", b & 0xff));
            }
            digest = sb.toString();
        } catch (UnsupportedEncodingException ex) {

            digest = "";
        } catch (NoSuchAlgorithmException ex) {

            digest = "";
        }

        return digest;

    }

    //Util for VNPAY
    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return hmacSHA512(secretKey, sb.toString());
    }


    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {

        String ipAdress;
        try {

            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {

                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {

            ipAdress = "Invalid IP:" + e.getMessage();
        }

        return ipAdress;

    }

    public static String getRandomNumber(int len) {

        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {

            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }

        return sb.toString();

    }

    /**
     * Trả về ý nghĩa của mã phản hồi VNPay
     */
    public static String getVNPayResponseMeaning(String responseCode) {
        switch (responseCode) {
            case "00": return "Giao dịch thành công";
            case "01": return "Giao dịch chưa hoàn tất";
            case "02": return "Merchant không hợp lệ";
            case "04": return "Số tiền không hợp lệ";
            case "05": return "Mã đơn hàng trùng lặp";
            case "06": return "Thông tin khách hàng không hợp lệ";
            case "07": return "Giao dịch bị nghi ngờ gian lận";
            case "09": return "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking";
            case "10": return "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11": return "Đã hết hạn chờ thanh toán";
            case "12": return "Thẻ/Tài khoản bị khóa";
            case "13": return "Sai mật khẩu xác thực giao dịch (OTP)";
            case "24": return "Khách hàng hủy giao dịch";
            case "51": return "Tài khoản không đủ số dư để thanh toán";
            case "65": return "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
            case "75": return "Ngân hàng thanh toán đang bảo trì";
            case "79": return "Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định";
            case "99": return "Lỗi không xác định";
            default: return "Không xác định hoặc không có mô tả cho mã này";
        }
    }

}