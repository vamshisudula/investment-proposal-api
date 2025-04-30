// PDF Header and Footer configuration

exports.header = {
  height: '2.5cm',
  contents: function(pageNum, numPages) {
    return `
      <div style="width: 100%; height: 2.5cm; margin: 0; padding: 0;">
        <img src="assets/header.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    `;
  }
};

exports.footer = {
  height: '2cm',
  contents: function(pageNum, numPages) {
    return `
      <div style="width: 100%; height: 2cm; margin: 0; padding: 0; position: relative;">
        <img src="assets/footer.png" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom: 0.5cm; right: 2cm; text-align: right;">
          <div style="color: white; font-size: 8pt;">Page ${pageNum} of ${numPages}</div>
          <div style="color: white; font-size: 8pt;">Confidential | INVEST4EDU PRIVATE LIMITED</div>
        </div>
      </div>
    `;
  }
}; 