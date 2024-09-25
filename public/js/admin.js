const deleteProduct = async (btn) => {
  const prodId = btn.parentNode.querySelector('[name="productId"]').value;
  const article = btn.closest("article");

  try {
    const response = await fetch("/admin/delete-product/" + prodId, {
      method: "DELETE",
    });

    const resData = await response.json();

    if (response.status === 500 || !response.ok) {
      throw new Error(resData.message);
    }

    article.remove();
  } catch (err) {
    console.log(err);
  }
};
