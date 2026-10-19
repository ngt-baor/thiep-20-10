# Lá thư 20·10

Mẫu thiệp chúc mừng Ngày Phụ nữ Việt Nam, dùng Next.js App Router và một API route không cần cơ sở dữ liệu.

## Chạy trên máy

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở <http://localhost:3000>. API lời chúc có tại <http://localhost:3000/api/greeting>.

Các phiên bản Next.js/React được ghim trong `package.json` và `package-lock.json`; trước khi phát hành, hãy kiểm tra bản ổn định và cảnh báo bảo mật mới nhất trên [npm](https://www.npmjs.com/package/next) và [tài liệu Next.js](https://nextjs.org/docs).

## Kiểm tra và build

```bash
npm test
npm run build
npm start
```

## Deploy lên Vercel

Đưa thư mục này lên Git provider rồi import repository vào Vercel. Vercel nhận diện Next.js tự động; dùng lệnh build mặc định `npm run build`. Không cần tạo database, biến môi trường hoặc `vercel.json` cho mẫu này.

## Sửa lời chúc

Chỉnh nội dung trong [`lib/greeting.js`](lib/greeting.js). Hai mặt thiệp được API `/api/greeting` trả về; giao diện tự hiển thị mặt trước và mặt sau từ response.

## Tài liệu

- [Báo cáo dự án](docs/project-report.md)
- [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
