// const urlUji = "https://script.google.com/macros/s/AKfycbwIxK2AEFdV17lU7tfwpHdBs5r8LIz5brTdX7_K4RJ-/dev";
const url =
  "https://script.google.com/macros/s/AKfycbzutCVWhEYBiBFVo7GdmAy336yIqpiK-hi-OLNiCJbhZNfEvTM_pQhWU9xGAL4nCy_-Iw/exec";

const gscriptUrl = (nip, flag = "", fcm = "") =>
  fetch(url, {
    method: "post",
    body: JSON.stringify({ nip: nip, flag: flag, fcm : fcm }),
  });


$("form").on("submit", proses);

function proses(e) {
  e.preventDefault();

  $("#loading").modal("show");

  let nip = document.querySelector("#nip").value;

  gscriptUrl(nip)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res.status == 200) {
        setTimeout(() => {
          gscriptUrl(nip, "ambil response", localStorage.getItem('fcm'))
            .then((res) => res.json())
            .then((res) => {
            $("#loading").modal("hide");
            $('#modal_pesan').modal('show')
            $('#modal_pesan .modal-body').html(`<p>${res.status}</p>`)
            $('#modal_pesan .modal-header').removeClass("bg-danger")
            $('#modal_pesan .modal-header').addClass("bg-success text-light")
          })
          .catch((err) => {
            $("#loading").modal("hide");
            $('#modal_pesan').modal('show')
            $('#modal_pesan .modal-body').html(`<p>Coba cek di aplikasi aslinya, kayaknya sudah berhasilmi</p>`)
            $('#modal_pesan .modal-header').removeClass("bg-success")
            $('#modal_pesan .modal-header').addClass("bg-danger text-light")
          });
        }, 3000);
      }
    })
    .catch((err) => {
      $("#loading").modal("hide");
      $('#modal_pesan').modal('show');
      $('#modal_pesan .modal-body').html(`<p>Ups.. lagi gangguanki yang disana</p>`)
      $('#modal_pesan .modal-header').removeClass("bg-success")
      $('#modal_pesan .modal-header').addClass("bg-danger text-light")
    });
}


fetch("https://candaan-api.vercel.app/api/text/random")
  .then((response) => response.json())
  .then((result) => $('#quotes').text(result.data));