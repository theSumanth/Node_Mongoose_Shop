const path = require("path");

const pdfDocument = require("pdfkit");

exports.generateInvoice = (orderId, order, req, res) => {
  const pdfDoc = new pdfDocument();
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Deposition", invoiceName);

  pdfDoc.pipe(res);
  pdfDoc.fontSize(28).text("Invoice", {
    underline: true,
    align: "left",
  });
  pdfDoc
    .fontSize(14)
    .text("-----------------------------------------------------", {
      align: "left",
      lineGap: 20,
    });
  let totalPrice = 0;
  order.products.forEach((prod) => {
    pdfDoc
      .fontSize(12)
      .text(
        prod.productId.title +
          " - " +
          prod.productId.price +
          " x " +
          prod.quantity
      );
    totalPrice += prod.quantity * prod.productId.price;
  });

  pdfDoc
    .fontSize(14)
    .text("-----------------------------------------------------", {
      align: "left",
      lineGap: 10,
    });
  pdfDoc
    .fontSize(18)
    .text("Total Price: ", {
      continued: true,
    })
    .fontSize(20)
    .text(totalPrice);
  pdfDoc.end();
};
