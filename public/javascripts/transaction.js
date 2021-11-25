$(document).ready(function () {
  $("#transactionsTable").DataTable({
    paging: true,
    ordering: true,
    info: false,
    order: [[0, "desc"]],
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
  });
});


