$(document).ready(async function () {
  $("#tradeTable").DataTable({ paging: true, ordering: true, info: false });
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

  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily =
    'Nunito,-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = "#858796";

  const apiUrlPie = `/app/trade/getSymbolsByUser`;

  try {
    const resFromAPI = await axios.get(apiUrlPie);
    const graphLabels = resFromAPI.data.map(
      (item) => item._id.name + "(" + item._id.symbol + ")"
    );
    const pieValues = resFromAPI.data.map((item) => parseFloat(item.amount));
    const profitAmount = resFromAPI.data.reduce(
      (total, item) =>
        (total +=
          parseFloat(item.units) * parseFloat(item.actualPrice) -
          parseFloat(item.amount)),
      0
    );
    const investAmount = resFromAPI.data.reduce(
      (total, item) => (total += parseFloat(item.amount)),
      0
    );
    let profitAvg = profitAmount / investAmount;
    if (isNaN(profitAvg)) {
      profitAvg = 0.0;
    }
    document.getElementById("profitAmount").innerHTML = profitAmount.toFixed(2); //+ ' %';
    document.getElementById("profitAvg").innerHTML = profitAvg.toFixed(2); //+ ' %';
    if (profitAmount < 0) {
      $("#arrowIcon").addClass("fas fa-arrow-circle-down fa-2x text-danger");
    } else if (profitAmount > 0) {
      $("#arrowIcon").addClass("fas fa-arrow-circle-up fa-2x text-success");
    } else {
      $("#arrowIcon").addClass("fas fa-balance-scale fa-2x text-gray-300");
    }

    const graphBColor = [];
    const graphHColor = [];
    pieValues.forEach((data) => {
      let graphColors = getRandomGraphColor();
      graphBColor.push(graphColors.background);
      graphHColor.push(graphColors.hover);
    });
    const ctxTrade = document.getElementById("balanceInvestPie");
    const myPieChart = new Chart(ctxTrade, {
      type: "doughnut",
      data: {
        labels: graphLabels,
        datasets: [
          {
            data: pieValues,
            backgroundColor: graphBColor,
            hoverBackgroundColor: graphHColor,
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: true,
          position: "bottom",
        },
        cutoutPercentage: 80,
      },
    });
  } catch (err) {
    console.log("Error while getting the data: ", err);
  }
});
