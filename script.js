// const urlUji = "https://script.google.com/macros/s/AKfycbwIxK2AEFdV17lU7tfwpHdBs5r8LIz5brTdX7_K4RJ-/dev";
const url =
  "https://script.google.com/macros/s/AKfycbzutCVWhEYBiBFVo7GdmAy336yIqpiK-hi-OLNiCJbhZNfEvTM_pQhWU9xGAL4nCy_-Iw/exec";
const midtransSandboxCLientKey = "SB-Mid-client-iFDWn0OnvfLYSIzb";

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
      console.log("First response:", res);
      if (res.status == 'ilegal') {
        $("#loading").modal("hide");
        $('#modal_pesan').modal('show')
        $('#modal_pesan .modal-body').html(`<p>Buang mengkudu buah manggis (cakep...), \n Sedekah dulu pake Qris. xixixi</p>`)
        $('#modal_pesan .modal-header').removeClass("bg-success")
        $('#modal_pesan .modal-header').addClass("bg-danger text-light")
        return;
      }

      if (res.status == 'belum bayar') {
        $("#loading").modal("hide");
        payWithSnap(res);
        return;
      }

      if (res.status == 200) {
        setTimeout(() => {
          gscriptUrl(nip, "ambil response", localStorage.getItem('fcm'))
            .then((res) => res.json())
            .then((res) => {
              console.log("Second response:", res);
              $("#loading").modal("hide");
              if (res.status == 'belum bayar') {
                payWithSnap(res);
              } else {
                $('#modal_pesan').modal('show')
                $('#modal_pesan .modal-body').html(`<p>${res.status}</p>`)
                $('#modal_pesan .modal-header').removeClass("bg-danger")
                $('#modal_pesan .modal-header').addClass("bg-success text-light")
              }
            })
            .catch((err) => {
              alert(err)
              $("#loading").modal("hide");
              $('#modal_pesan').modal('show')
              $('#modal_pesan .modal-body').html(`<p>Coba cek di aplikasi aslinya, kayaknya sudah berhasilmi</p>`)
              $('#modal_pesan .modal-header').removeClass("bg-success")
              $('#modal_pesan .modal-header').addClass("bg-danger text-light")
            });
        }, 5000);
      }
    })
    .catch((err) => {
      alert(err)
      $("#loading").modal("hide");
      $('#modal_pesan').modal('show');
      $('#modal_pesan .modal-body').html(`<p>Ups.. lagi gangguanki yang disana</p>`)
      $('#modal_pesan .modal-header').removeClass("bg-success")
      $('#modal_pesan .modal-header').addClass("bg-danger text-light")
    });
}

function payWithSnap(res) {
  if (typeof snap !== 'undefined') {
    snap.pay(res.token, {
      onSuccess: function (result) {
        $("#loading").modal("hide");
        $('#modal_pesan').modal('show')
        $('#modal_pesan .modal-body').html(`<p>Pembayaran Berhasil!</p>`)
        $('#modal_pesan .modal-header').removeClass("bg-danger").addClass("bg-success text-light")
      },
      onPending: function (result) {
        $("#loading").modal("hide");
        $('#modal_pesan').modal('show')
        $('#modal_pesan .modal-body').html(`<p>Menunggu Pembayaran...</p>`)
        $('#modal_pesan .modal-header').removeClass("bg-success").addClass("bg-warning text-dark")
      },
      onError: function (result) {
        $("#loading").modal("hide");
        $('#modal_pesan').modal('show')
        $('#modal_pesan .modal-body').html(`<p>Pembayaran Gagal!</p>`)
        $('#modal_pesan .modal-header').removeClass("bg-success").addClass("bg-danger text-light")
      },
      onClose: function () {
        $("#loading").modal("hide");
      }
    });
  } else {
    $("#loading").modal("hide");
    $('#modal_pesan').modal('show');
    $('#modal_pesan .modal-body').html(`
      <p>Sistem pembayaran tidak termuat. Anda dapat membayar melalui tautan berikut:</p>
      <a href="${res.redirect_url}" target="_blank" class="btn btn-primary w-100">Bayar Sekarang</a>
    `);
    $('#modal_pesan .modal-header').removeClass("bg-success").addClass("bg-warning text-dark");
  }
}


fetch("https://candaan-api.vercel.app/api/text/random")
  .then((response) => response.json())
  .then((result) => $('#quotes').text(result.data));