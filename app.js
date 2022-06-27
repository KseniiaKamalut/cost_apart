let dateNow = new Date();
let defaultValues = {
  'city': 2, // Пермь
  'year': dateNow.getFullYear(),
  'season': Math.floor(dateNow.getMonth() / 3) + 1,
};

let placeholdersForCity = {
  1: {
    'newHouses': 2391.1,
    'mortgage': 89816,
  },
  2: {
    'newHouses': 1112.929,
    'mortgage': 48905,
  },
  3: {
    'newHouses': 2675.5,
    'mortgage': 86231,
  },
  4: {
    'newHouses': 1756.5,
    'mortgage': 67420,
  },
  5: {
    'newHouses': 1464.2,
    'mortgage': 56536,
  },
  6: {
    'newHouses': 5024.8,
    'mortgage': 389842,
  },
  7: {
    'newHouses': 3471.2,
    'mortgage': 193359,
  },
}

let cityCoords = [
  [56.85, 60.61], // ekat
  [58.01, 56.25], // perm
  [55.79, 49.12], // kazan
  [55.04, 82.93], // novosib
  [55.15, 61.43], // chelab
  [55.76, 37.64], // moscow
  [59.94, 30.31], // piter
  [56.326887, 44.005986], // nizhn
  [44.039770, 43.070804], // pyatig
  [47.222531, 39.718705], // rostov
  [48.472584, 135.057732], // habarovsk
  [53.194546, 45.019529], // penza
  [45.035470, 38.975313], //krasnodar
  [51.533562, 46.034266], //saratov
  [57.152985, 65.541227], //tumen
  [53.507852, 49.420411], //toliatti
  [56.852676, 53.206900], //ijevsk
  [53.346785, 83.776856], //barnaul
  [52.289588, 104.280606], //irkytsk
  [57.626559, 39.893813], //yaroslavl
];

let placeholders = {
  'dollarRate': '63.62',
  'brentRate': '3530.2738',
  'GNP': '109361.5',
  'newHouses': '1112.929',
  'mortgage': '48905',
};

function setDefaultValues(defaultValues) {
  for (let key in defaultValues) {
    if (defaultValues.hasOwnProperty(key))
      $('#' + key).val(defaultValues[key]);
  }
}

function setPlaceholders(placeholders) {
  for (let key in placeholders) {
    if (placeholders.hasOwnProperty(key))
      $('#' + key).attr('placeholder', placeholders[key]);
  }
}

setDefaultValues(defaultValues);
setPlaceholders(placeholders);

function setValueFromPlaceholder() {
  $('#form').find('input').each(function () {
    let t = $(this);
    let placeholderVal = t.attr('placeholder');
    if (t.val().length === 0 && placeholderVal !== undefined) {
      t.val(placeholderVal);
    }
  });
}

function calc() {
  setValueFromPlaceholder();
  let $form = $('#form');
  if ($form.get(0).reportValidity()) {
    $.ajax({
      method: 'post',
      url: 'calc.php',
      data: $form.serialize(),
      success: function (res) {
        document.getElementById("valueWrapper").style.display = 'block';
        document.getElementById("calcValue").innerText = res;
      },
      error: function () {
        alert('Что-то пошло не так, перезагрузите страницу');
      }
    });
  }
}

document.getElementById('calcButton').addEventListener('click', function () {
  calc();
});

$(document).ready(function () {
  $('#year').val((new Date()).getFullYear());
});

ymaps.ready(init);

function init() {
  // Создание карты.
  let myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11
  });

  $('#getCoords').click(function () {
    let address = encodeURI($("#city option:selected").text() + ',' + $('#address').val());
    let url = 'https://geocode-maps.yandex.ru/1.x?geocode=' + address + '&apikey=7fd86f12-0eba-4a1a-a4e5-2fc942556675&format=json';
    $.get(url, function (res) {
      let lngLat = res.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
      $('#lon').val(lngLat[0]);
      $('#lat').val(lngLat[1]);

      setNewPoint(lngLat.reverse());
    });
  });

  function changeCity(cityId) {
    myMap.setCenter(cityCoords[cityId - 1], 11);
  }

  function setNewPlaceholdersForNewCity(cityId) {
    Object.keys(placeholdersForCity[cityId]).forEach((key) => {
      $('#' + key).val('').attr('placeholder', placeholdersForCity[cityId][key]);
    });
  }

  let myGeoObject = null;

  function setNewPoint(coords) {
    if (!myGeoObject) {
      myGeoObject = new ymaps.GeoObject({
        // Описание геометрии.
        geometry: {
          type: "Point",
          coordinates: coords
        },
        // Свойства.
        properties: {
          // Контент метки.
          iconContent: 'Выбранный дом',
        }
      }, {
        preset: 'islands#redDotIcon',
      });

      myMap.geoObjects.add(myGeoObject);
    }

    window.aa = myGeoObject;

    myGeoObject.geometry.setCoordinates(coords);

    myMap.setCenter(coords, 17);
  }

  $('#city').change(function () {
    $('#valueWrapper').hide();
    let cityId = parseInt($(this).val());
    changeCity(cityId);
    setNewPlaceholdersForNewCity(cityId);
  }).change();
}