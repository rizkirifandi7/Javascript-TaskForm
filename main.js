// Class untuk pendaftar
class Pendaftar {
	constructor(nama, umur, uangSaku) {
		this.nama = nama;
		this.umur = umur;
		this.uangSaku = uangSaku;
	}

	// Metode untuk validasi pendaftar
	isValid() {
		return this.nama.length >= 10 && this.umur >= 25 && this.uangSaku >= 100000 && this.uangSaku <= 1000000;
	}

	// Metode untuk mendapatkan resume
	getResume(pendaftarList) {
		const rataRataUmur = Pendaftar.hitungRataRataUmur(pendaftarList);
		const rataRataUangSaku = Pendaftar.hitungRataRataUangSaku(pendaftarList);
		return `Rata-rata pendaftar memiliki uang saku sebesar ${rataRataUangSaku} dengan rata rata umur ${rataRataUmur}`;
	}

	static hitungRataRataUmur(pendaftarList) {
		const totalUmur = pendaftarList.reduce((total, pendaftar) => total + pendaftar.umur, 0);
		return totalUmur / pendaftarList.length;
	}

	static hitungRataRataUangSaku(pendaftarList) {
		const totalUangSaku = pendaftarList.reduce((total, pendaftar) => total + pendaftar.uangSaku, 0);
		return totalUangSaku / pendaftarList.length;
	}

	// Metode asinkronus untuk menampilkan popup "Data berhasil disimpan"
	async showSuccessPopup() {
		$("#successModal").modal("show");
		await new Promise((resolve) => setTimeout(resolve, 2000)); // Menunggu 2 detik
		$("#successModal").modal("hide");
	}
}

// Daftar pendaftar
const pendaftarList = [];
const table = $("#tabelPendaftar").DataTable({
	columns: [
		{ data: "nama" },
		{ data: "umur" },
		{ data: "uangSaku" },
		{
			data: null,
			render: function (data, type, row) {
				return `<button class="btn btn-warning edit">Edit</button> <button class="btn btn-danger hapus">Hapus</button>`;
			},
		},
	],
	pageLength: 5,
	lengthMenu: [
		[5, 10, 20, -1],
		[5, 10, 15, "All"],
	],
	paging: true,
	searching: true,
	ordering: true,
	stateSave: true,
	language: {
		search: "",
		searchPlaceholder: "Search...",
		lengthMenu: "Show _MENU_",
	},
});

// Fungsi untuk menghapus pendaftar berdasarkan nama
function hapusPendaftar(nama) {
	const index = pendaftarList.findIndex((pendaftar) => pendaftar.nama === nama);
	if (index !== -1) {
		pendaftarList.splice(index, 1);
	}
}

// Fungsi untuk mengisi formulir dengan data pendaftar yang akan diedit
function editPendaftar(nama) {
	const pendaftar = pendaftarList.find((pendaftar) => pendaftar.nama === nama);
	if (pendaftar) {
		$("#editIndex").val(pendaftarList.indexOf(pendaftar));
		$("#editNama").val(pendaftar.nama);
		$("#editUmur").val(pendaftar.umur);
		$("#editUangSaku").val(pendaftar.uangSaku);
	}
}

// Objek untuk melacak status validasi input
const validationStatus = {
	nama: false,
	umur: false,
	uangSaku: false,
};

// Fungsi untuk menampilkan pesan validasi
function showValidationMessage(inputElement, messageElement, message) {
	$(messageElement).text(message);
	$(messageElement).show();
	$(inputElement).addClass("is-invalid");
}

// Fungsi untuk menyembunyikan pesan validasi
function hideValidationMessage(inputElement, messageElement) {
	$(messageElement).hide();
	$(inputElement).removeClass("is-invalid");
}

// Event handler untuk tombol Edit dan Hapus di setiap baris tabel
$("#tabelPendaftar tbody").on("click", "button.edit", function () {
	const data = table.row($(this).parents("tr")).data();
	editPendaftar(data.nama);
	$("#editModal").modal("show"); // Menampilkan modal edit
});

// Event handler untuk tombol Hapus di setiap baris tabel
$("#tabelPendaftar tbody").on("click", "button.hapus", function () {
	const data = table.row($(this).parents("tr")).data();
	hapusPendaftar(data.nama);
	table.row($(this).parents("tr")).remove().draw();
	$("#resumeText").text(new Pendaftar().getResume(pendaftarList));
});

// Event handler untuk tombol "Update" di modal edit
$("#btnUpdate").click(function () {
	const index = $("#editIndex").val();
	const nama = $("#editNama").val();
	const umur = parseInt($("#editUmur").val());
	const uangSaku = parseInt($("#editUangSaku").val());

	const pendaftar = new Pendaftar(nama, umur, uangSaku);

	if (!pendaftar.isValid()) {
		alert("Data tidak memenuhi kriteria.");
		return;
	}

	pendaftarList[index] = pendaftar;

	// Menampilkan data pendaftar dalam DataTable
	table.clear().rows.add(pendaftarList).draw();

	// Menyembunyikan modal edit
	$("#editModal").modal("hide");

	// Menampilkan resume
	$("#resumeText").text(new Pendaftar().getResume(pendaftarList));
});

// Event handler untuk form registrasi
$("#registrationForm").submit(async function (e) {
	e.preventDefault();

	const nama = $("#nama").val();
	const umur = parseInt($("#umur").val());
	const uangSaku = parseInt($("#uangSaku").val());

	// Validasi input Nama
	if (nama.length < 10) {
		showValidationMessage("#nama", "#namaHelp", "Nama minimal 10 karakter.");
		validationStatus.nama = false;
	} else {
		hideValidationMessage("#nama", "#namaHelp");
		validationStatus.nama = true;
	}

	// Validasi input Umur
	if (umur < 25) {
		showValidationMessage("#umur", "#umurHelp", "Umur minimal 25 tahun.");
		validationStatus.umur = false;
	} else {
		hideValidationMessage("#umur", "#umurHelp");
		validationStatus.umur = true;
	}

	// Validasi input Uang Saku
	if (uangSaku < 100000 || uangSaku > 1000000) {
		showValidationMessage("#uangSaku", "#uangSakuHelp", "Uang saku minimal 100 ribu dan maksimal 1 juta.");
		validationStatus.uangSaku = false;
	} else {
		hideValidationMessage("#uangSaku", "#uangSakuHelp");
		validationStatus.uangSaku = true;
	}

	// Cek status validasi untuk semua input
	if (Object.values(validationStatus).every((status) => status === true)) {
		const pendaftar = new Pendaftar(nama, umur, uangSaku);

		const existingIndex = pendaftarList.findIndex((pendaftar) => pendaftar.nama === nama);

		if (existingIndex !== -1) {
			// Jika data dengan nama yang sama sudah ada, update data tersebut
			pendaftarList[existingIndex] = pendaftar;
		} else {
			pendaftarList.push(pendaftar);
		}

		// Menampilkan data pendaftar dalam DataTable
		table.clear().rows.add(pendaftarList).draw();

		// Menampilkan resume
		$("#resumeText").text(new Pendaftar().getResume(pendaftarList));

		// Mereset form
		$("#registrationForm")[0].reset();

		// Menampilkan popup "Data berhasil disimpan" secara asinkronus
		await pendaftar.showSuccessPopup();
	}
});

// Event handler untuk input Nama
$("#nama").on("input", function () {
	if ($(this).val().length >= 10) {
		hideValidationMessage("#nama", "#namaHelp");
		validationStatus.nama = true;
	} else {
		validationStatus.nama = false;
	}
});

// Event handler untuk input Umur
$("#umur").on("input", function () {
	const umurValue = parseInt($(this).val());
	if (umurValue >= 25) {
		hideValidationMessage("#umur", "#umurHelp");
		validationStatus.umur = true;
	} else {
		validationStatus.umur = false;
	}
});

// Event handler untuk input Uang Saku
$("#uangSaku").on("input", function () {
	const uangSakuValue = parseInt($(this).val());
	if (uangSakuValue >= 100000 && uangSakuValue <= 1000000) {
		hideValidationMessage("#uangSaku", "#uangSakuHelp");
		validationStatus.uangSaku = true;
	} else {
		validationStatus.uangSaku = false;
	}
});
