import React from "react";
import "../assets/css/footer.scss";

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-left">
        <span className="member-text">Members</span>
        <br /> <a href="https://www.facebook.com/svson1203/">Sa Văn Sơn</a>
        <br />
        <a href="https://www.facebook.com/PT7.BlackMen">Nguyễn Phúc Toàn</a>
      </div>
      <div className="footer-right">
        <span className="member-text">Project</span>
        <br />{" "}
        <a href="https://github.com/datnnt1997/bert_vn_ner/tree/3fe129ca75a31730f9dbf1485e7aa1addd7c9db5">
          Nghiên cứu, xây dựng mô hình <br />
          trích xuất thực thể trong <br />
          văn bản quy phạm pháp luật
        </a>
        <br />
      </div>
    </div>
  );
}
