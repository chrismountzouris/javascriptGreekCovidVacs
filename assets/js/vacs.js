$(document).ready(function() {

  var data = {
    date_from: '2020-12-24',
    date_to: '2022-01-15'
  };

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }

  $.ajax({
    url: 'https://data.gov.gr/api/v1/query/mdg_emvolio',
    data: data,
    dataType: 'json',
    headers: {
        'Authorization': 'Token d99450c9e2d9654b8b911ffb8d33f9a6291e95f8'
    },
    success: function(data) {

      console.log(data)

      function groupByKey(array, key) {
         return array
           .reduce((hash, obj) => {
             if(obj[key] === undefined) return hash;
             return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
           }, {})
      }

      var groupped_data = groupByKey(data, 'area');

      var total_tabled_data = [];

      var table_markup = '';

      jQuery.each(groupped_data, function(index, item) {

        var length_of_array = item.length;

        total_tabled_data[item[length_of_array-1].area] = item[length_of_array-1].totaldistinctpersons;

      });

      data.sort(function(a, b) {
        var keyA = new Date(a.referencedate),
          keyB = new Date(b.referencedate);
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });

      var immune_end = data.length-12*74;

      var last_day_index_start = data.length-74;
      var last_day_index_end = data.length-1;

      var day_total = 0;

      var summed_per_day = 0;

      var total_vaccinations = 0;
      var total_vaccinations_distinct = 0;

      var total_immune_started = 0;

      var temp_per_day_vaccination = 0;
      var temp_per_day_vaccination_distinct = 0;

      var per_day_vaccination = [];
      var per_day_vaccination_distinct = [];

      var summed_days_vaccinations = [];

      var date_array = [];

      var date_array_with_key = [];

      for (i = 0; i <= last_day_index_end; i++) {

        if (data[i].areaid == 1105){

          temp_per_day_vaccination += data[i].daytotal;

          summed_per_day += data[i].daytotal;

          per_day_vaccination.push(temp_per_day_vaccination);
          summed_days_vaccinations.push(summed_per_day);
          var formated_date = formatDate(data[i].referencedate);
          date_array.push(formated_date);

          date_array_with_key[formated_date] = temp_per_day_vaccination;

          temp_per_day_vaccination = 0;
          temp_per_day_vaccination_distinct = 0;

        }
        else{
          summed_per_day += data[i].daytotal;

          temp_per_day_vaccination += data[i].daytotal;
        }

      }

      for (i = last_day_index_start; i <= last_day_index_end; i++) {
        day_total += data[i].daytotal;
        total_vaccinations += data[i].totalvaccinations;
        total_vaccinations_distinct += data[i].totaldistinctpersons;
      }

      for (i = 0; i <= immune_end-1; i++) {
        total_immune_started += data[i].totaldistinctpersons;
      }

      var total_test = 0;

      // console.log(total_tabled_data);

      for (const property in total_tabled_data) {

        var area_rate = (total_tabled_data[property]/total_vaccinations_distinct)*100;
        var rounded_area_rate = Math.round(area_rate * 100) / 100;

        total_test = total_test + rounded_area_rate;

        var temp_markup = '<li class="mb-12pt"><div class="text-50 border-right"><small>'+ property +'</small></div><div class="flex"><div class="progress" style="height: 4px;"><div class="progress-bar bg-primary" role="progressbar" style="width: '+ rounded_area_rate +'%;" aria-valuenow="'+ rounded_area_rate +'" aria-valuemin="0" aria-valuemax="100"></div></div></div><div class="text-70"><small>'+ total_tabled_data[property] +'</small></div>';

        table_markup = table_markup + temp_markup;

      }

      $("#table_with_areas").html(table_markup);

      $("#summed_vaccinations").text(total_vaccinations);
      $("#summed_distinct_vaccinations").text(total_vaccinations_distinct);

      var rate = total_vaccinations_distinct*100/11000000;

      var rounded_rate = Math.round(rate * 100) / 100;

      var rate_1 = total_immune_started*100/11000000;

      var rounded_rate_1 = Math.round(rate_1 * 100) / 100;

      $("#population_rate").text(rounded_rate+' %');

      $("#population_rate_1").text(rounded_rate_1+' %');

      document.getElementById("progress_stats").style.width = rounded_rate+"%";

      document.getElementById("progress_stats_1").style.width = rounded_rate_1+"%";

      new Chart(document.getElementById("daily_vaccines"), {
        type: 'line',
        data: {
          labels: date_array,
          datasets: [{
              data: per_day_vaccination,
              borderColor: "#3e95cd",
              fill: false
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Ημερήσιοι Εμβολιασμοί'
          }
        }
      });

      new Chart(document.getElementById("daily_vaccines_summed"), {
        type: 'line',
        data: {
          labels: date_array,
          datasets: [{
              data: summed_days_vaccinations,
              label: "Πολίτες",
              borderColor: "#3e95cd",
              fill: false
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Συνολικοί Μοναδικοί Εμβολιασμοί'
          }
        }
      });


    }
  });

});
