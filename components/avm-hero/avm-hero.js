/* ==========================================================================
   AYO — AVM landing page: hero illustration (HTML/CSS, animated)
   Figma: ID desktop 28126:11219 (660×560), ID mobile 28135:11988 (360×560);
          EN desktop 28378:17893, EN mobile 28378:18973.

   Usage:  <div class="avm-hero__visual"><div data-avm-hero></div></div>
   The script fills [data-avm-hero] with the phone (AVM venue-owner home) and
   the floating feature cards, picks the strings by <html lang> ('id' →
   Indonesian, anything else → English), and scales the art to the width of
   its container: the 660×560 desktop composition from 560px up, the 360×560
   mobile composition (two floating cards) below. It sets the mount's height.

   Everything inside the phone and the cards is drawn in "app px" (the AVM
   app's own 360px-wide units) and scaled down to the Figma size:
   phone .690104, fund + report cards .72, schedule + staff cards .62.

   Motion (only while in view; static Figma frame with reduced motion):
   the cards enter one by one and then drift; the chart line draws and the
   statistics count up; the withdraw button is tapped and turns into a
   success state; the phone scrolls down to the upcoming schedule; the Excel
   chip is tapped and downloads; in the connected-courts grid the yellow and
   then the green booking appear, each blocking its linked court (no touch
   marker there); a staff role is picked; the phone
   scrolls back up; everything fades and the loop restarts.
   ========================================================================== */
(function(){
  'use strict';
  var mount = document.querySelector('[data-avm-hero]');
  if(!mount || mount._avmHero) return;
  mount._avmHero = true;

  var ID = (document.documentElement.lang || '').toLowerCase().indexOf('id') === 0;

  /* ---------- Strings (from the ID / EN Figma) ---------- */
  var S = ID ? {
    label:'Aplikasi AYO Venue Management: beranda venue dengan saldo, ringkasan statistik dan jadwal terdekat, serta fitur pencairan dana, laporan pendapatan, jadwal dan lapangan terhubung, dan hak akses staf.',
    venue:'Status Venue', open:'Buka', balance:'Saldo saat ini', detail:'Detail', stats:'Ringkasan Statistik',
    rev:'Pendapatan', res:'Reservasi', occ:'Okupansi', last:' dari bulan lalu', mil:' jt',
    months:['Jan','Mar','Mei','Jul','Sep','Nov','Jan'], upcoming:'Jadwal Terdekat',
    grass:'Rumput', tue:'Sel', wed:'Rab',
    fundTag:'Pencairan dana', withdraw:'Cairkan ke Rekening', withdrawn:'Dana dicairkan',
    repTag:'Laporan pendapatan', total:'Total Pendapatan',
    schTag:'Jadwal & lapangan terhubung', football:'Sepak Bola', linked:['Lapangan','Terhubung'],
    stfTag:'Hak akses staf', rights:'Hak Akses', more:'Selengkapnya',
    manager:'Dapat melihat statistik, laporan, saldo, mengatur reservasi, lapangan dan promosi.',
    staff:'Dapat mengatur jadwal reservasi dan menerima notifikasi terkait reservasi.'
  } : {
    label:'AYO Venue Management app: venue home with balance, statistics summary and upcoming schedule, plus fund withdrawal, revenue report, schedule and connected courts, and staff access rights.',
    venue:'Venue Status', open:'Open', balance:'Current balance', detail:'Detail', stats:'Statistics Summary',
    rev:'Revenue', res:'Reservations', occ:'Occupancy', last:' from last month', mil:'M',
    months:['Jan','Mar','May','Jul','Sep','Nov','Jan'], upcoming:'Upcoming Schedule',
    grass:'Grass', tue:'Tue', wed:'Wed',
    fundTag:'Fund withdrawal', withdraw:'Withdraw to Bank', withdrawn:'Funds withdrawn',
    repTag:'Revenue report', total:'Total Revenue',
    schTag:'Schedule & connected courts', football:'Football', linked:['Connected','Courts'],
    stfTag:'Staff access rights', rights:'Access Rights', more:'See more',
    manager:'Can view statistics, reports and balance, and manage reservations, courts and promos.',
    staff:'Can manage the reservation schedule and get reservation notifications.'
  };

  /* ---------- Icons (paths from the Figma exports) ---------- */
  var I = {
    paper:['0 0 13.8021 13.8021','<path d="M10.351 6.901V1.150L8.791 1.843C8.568 1.942 8.457 1.992 8.347 2.020C7.986 2.114 7.603 2.058 7.284 1.865C7.187 1.806 7.094 1.727 6.909 1.568C6.663 1.357 6.541 1.252 6.416 1.183C6.001 0.955 5.499 0.955 5.085 1.183C4.960 1.252 4.837 1.357 4.592 1.568C4.406 1.727 4.314 1.806 4.217 1.865C3.898 2.058 3.514 2.114 3.153 2.020C3.044 1.992 2.933 1.942 2.710 1.843L1.150 1.150V8.235C1.150 9.781 1.150 10.554 1.451 11.144C1.715 11.664 2.137 12.086 2.657 12.351C3.247 12.651 4.020 12.651 5.566 12.651H11.501M10.351 6.901H10.443C11.216 6.901 11.603 6.901 11.898 7.051C12.158 7.183 12.369 7.394 12.501 7.654C12.651 7.949 12.651 8.336 12.651 9.109V11.501C12.651 12.137 12.137 12.651 11.501 12.651M10.351 6.901V11.501C10.351 12.137 10.866 12.651 11.501 12.651M4.025 9.776H7.476M4.025 5.175H6.325M4.025 7.476H7.476" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="white"/>'],
    bell:['0 0 13.8021 13.8021','<path d="M6.901 13.227C5.847 13.227 4.959 12.518 4.686 11.552C6.151 11.806 7.650 11.806 9.115 11.552C8.842 12.518 7.954 13.227 6.901 13.227ZM6.901 0.718C9.044 0.718 10.782 2.456 10.782 4.600V5.790C10.782 6.196 10.934 6.587 11.208 6.886L12.014 7.766C12.718 8.536 12.433 9.772 11.463 10.156C8.532 11.315 5.269 11.315 2.338 10.156C1.368 9.772 1.083 8.536 1.787 7.766L2.593 6.886C2.867 6.587 3.019 6.196 3.019 5.790V4.600C3.019 2.456 4.757 0.718 6.901 0.718Z" stroke-width="1.035" stroke-linecap="round" stroke="white"/>'],
    chevW:['0 0 13.8021 13.8021','<path d="M4.830 2.932L8.971 6.901L4.830 10.869" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="white"/>'],
    money:['0 0 13.8021 13.8021','<g> <path d="M12.653 9.770H1.151C0.999 9.770 0.852 9.831 0.744 9.939C0.637 10.047 0.576 10.193 0.576 10.345C0.576 10.498 0.637 10.644 0.744 10.752C0.852 10.860 0.999 10.920 1.151 10.920H12.653C12.805 10.920 12.952 10.860 13.06 10.752C13.167 10.644 13.228 10.498 13.228 10.345C13.228 10.193 13.167 10.047 13.06 9.939C12.952 9.831 12.805 9.770 12.653 9.770ZM12.653 12.071H1.151C0.999 12.071 0.852 12.131 0.744 12.239C0.637 12.347 0.576 12.493 0.576 12.646C0.576 12.798 0.637 12.945 0.744 13.052C0.852 13.160 0.999 13.221 1.151 13.221H12.653C12.805 13.221 12.952 13.160 13.06 13.052C13.167 12.945 13.228 12.798 13.228 12.646C13.228 12.493 13.167 12.347 13.06 12.239C12.952 12.131 12.805 12.071 12.653 12.071ZM3.451 4.019C3.338 4.019 3.226 4.053 3.132 4.116C3.037 4.180 2.964 4.269 2.920 4.374C2.877 4.479 2.865 4.595 2.887 4.707C2.910 4.818 2.964 4.921 3.045 5.001C3.125 5.082 3.228 5.136 3.339 5.159C3.451 5.181 3.566 5.169 3.671 5.126C3.777 5.082 3.866 5.009 3.930 4.914C3.993 4.819 4.027 4.708 4.027 4.594C4.027 4.442 3.966 4.296 3.858 4.188C3.750 4.080 3.604 4.019 3.451 4.019ZM11.503 0.569H2.301C1.844 0.569 1.405 0.751 1.081 1.074C0.758 1.398 0.576 1.837 0.576 2.294V6.895C0.576 7.352 0.758 7.791 1.081 8.115C1.405 8.438 1.844 8.620 2.301 8.620H11.503C11.960 8.620 12.399 8.438 12.723 8.115C13.046 7.791 13.228 7.352 13.228 6.895V2.294C13.228 1.837 13.046 1.398 12.723 1.074C12.399 0.751 11.960 0.569 11.503 0.569V0.569ZM12.078 6.895C12.078 7.047 12.017 7.194 11.909 7.301C11.801 7.409 11.655 7.470 11.503 7.470H2.301C2.149 7.470 2.002 7.409 1.895 7.301C1.787 7.194 1.726 7.047 1.726 6.895V2.294C1.726 2.142 1.787 1.995 1.895 1.887C2.002 1.780 2.149 1.719 2.301 1.719H11.503C11.655 1.719 11.801 1.780 11.909 1.887C12.017 1.995 12.078 2.142 12.078 2.294V6.895ZM6.902 2.869C6.561 2.869 6.227 2.970 5.943 3.160C5.660 3.350 5.439 3.619 5.308 3.934C5.177 4.25 5.143 4.596 5.210 4.931C5.276 5.266 5.441 5.573 5.682 5.814C5.923 6.056 6.231 6.220 6.565 6.287C6.900 6.353 7.247 6.319 7.562 6.188C7.877 6.058 8.147 5.837 8.336 5.553C8.526 5.269 8.627 4.936 8.627 4.594C8.627 4.137 8.445 3.698 8.122 3.375C7.798 3.051 7.360 2.869 6.902 2.869ZM6.902 5.170C6.788 5.170 6.677 5.136 6.582 5.073C6.488 5.009 6.414 4.920 6.371 4.815C6.327 4.709 6.316 4.594 6.338 4.482C6.360 4.371 6.415 4.268 6.495 4.188C6.576 4.107 6.678 4.053 6.790 4.030C6.901 4.008 7.017 4.020 7.122 4.063C7.227 4.107 7.317 4.180 7.380 4.275C7.443 4.370 7.477 4.481 7.477 4.594C7.477 4.747 7.416 4.893 7.309 5.001C7.201 5.109 7.054 5.170 6.902 5.170ZM10.353 4.019C10.239 4.019 10.128 4.053 10.033 4.116C9.938 4.180 9.865 4.269 9.821 4.374C9.778 4.479 9.766 4.595 9.788 4.707C9.811 4.818 9.865 4.921 9.946 5.001C10.026 5.082 10.129 5.136 10.240 5.159C10.352 5.181 10.468 5.169 10.573 5.126C10.678 5.082 10.767 5.009 10.831 4.914C10.894 4.819 10.928 4.708 10.928 4.594C10.928 4.442 10.867 4.296 10.759 4.188C10.651 4.080 10.505 4.019 10.353 4.019Z" fill="white"/>'],
    arrowR:['0 0 13.8021 13.8021','<path d="M7.476 9.197L9.776 6.897L7.476 4.596M9.776 6.897H4.025" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="#9E0620"/>'],
    upRed:['0 0 5.52089 4.6007','<path d="M3.280 0.169C3.307 0.195 3.421 0.294 3.515 0.385C4.105 0.921 5.071 2.319 5.366 3.051C5.414 3.162 5.514 3.443 5.520 3.594C5.520 3.737 5.487 3.875 5.420 4.005C5.326 4.169 5.179 4.299 5.004 4.371C4.883 4.417 4.521 4.489 4.515 4.489C4.119 4.561 3.475 4.600 2.764 4.600C2.086 4.600 1.469 4.561 1.066 4.502C1.060 4.495 0.610 4.424 0.456 4.345C0.174 4.201 0 3.920 0 3.620V3.594C0.006 3.398 0.181 2.986 0.188 2.986C0.483 2.293 1.402 0.927 2.012 0.378C2.012 0.378 2.169 0.224 2.267 0.156C2.408 0.051 2.582 0 2.757 0C2.951 0 3.133 0.058 3.280 0.169" fill="#F44335"/>'],
    upGreen:['0 0 5.52088 4.60071','<path d="M3.280 0.169C3.307 0.195 3.421 0.294 3.515 0.385C4.105 0.921 5.071 2.319 5.366 3.051C5.414 3.162 5.514 3.443 5.520 3.594C5.520 3.737 5.487 3.875 5.420 4.005C5.326 4.169 5.179 4.299 5.004 4.371C4.883 4.417 4.521 4.489 4.515 4.489C4.119 4.561 3.475 4.600 2.764 4.600C2.086 4.600 1.469 4.561 1.066 4.502C1.060 4.495 0.610 4.424 0.456 4.345C0.174 4.201 4.394e-05 3.920 4.394e-05 3.620V3.594C0.006 3.398 0.181 2.986 0.188 2.986C0.483 2.293 1.402 0.927 2.012 0.378C2.012 0.378 2.169 0.224 2.267 0.156C2.408 0.052 2.582 1.098e-05 2.757 1.098e-05C2.951 1.098e-05 3.133 0.058 3.280 0.169" fill="#00C48C"/>'],
    info:['0 0 9.54644 9.54644','<path d="M4.773 0.517C7.123 0.517 9.028 2.422 9.028 4.773C9.028 7.123 7.123 9.028 4.773 9.028C2.422 9.028 0.517 7.123 0.517 4.773C0.517 2.422 2.422 0.517 4.773 0.517Z" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="#52575C"/> <path d="M4.770 3.026L4.770 5.059" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="#52575C"/> <path d="M4.770 6.519H4.775" stroke-width="1.380" stroke-linecap="round" stroke-linejoin="round" stroke="#52575C"/>'],
    check:['0 0 11.0417 11.0417','<path d="M6.772 4.040L4.798 6.019L4.039 5.259C3.998 5.211 3.947 5.172 3.890 5.145C3.833 5.117 3.771 5.101 3.707 5.099C3.644 5.097 3.581 5.107 3.522 5.130C3.463 5.153 3.409 5.189 3.364 5.233C3.319 5.278 3.284 5.332 3.261 5.391C3.238 5.450 3.227 5.513 3.230 5.576C3.232 5.640 3.248 5.702 3.275 5.759C3.303 5.816 3.342 5.867 3.390 5.908L4.471 6.994C4.514 7.037 4.565 7.070 4.621 7.093C4.677 7.116 4.737 7.128 4.798 7.127C4.919 7.127 5.034 7.079 5.120 6.994L7.420 4.694C7.463 4.651 7.498 4.600 7.521 4.544C7.544 4.488 7.556 4.428 7.556 4.367C7.556 4.306 7.544 4.246 7.521 4.190C7.498 4.134 7.463 4.083 7.420 4.040C7.334 3.955 7.218 3.906 7.096 3.906C6.974 3.906 6.858 3.955 6.772 4.040V4.040ZM5.520 0.916C4.610 0.916 3.721 1.186 2.964 1.692C2.208 2.197 1.618 2.916 1.270 3.756C0.922 4.597 0.830 5.522 1.008 6.415C1.186 7.307 1.624 8.127 2.267 8.770C2.911 9.414 3.730 9.852 4.623 10.029C5.515 10.207 6.440 10.116 7.281 9.768C8.122 9.419 8.840 8.830 9.346 8.073C9.851 7.317 10.121 6.427 10.121 5.517C10.121 4.913 10.002 4.315 9.771 3.756C9.540 3.198 9.201 2.691 8.773 2.264C8.346 1.837 7.839 1.498 7.281 1.267C6.723 1.035 6.124 0.916 5.520 0.916V0.916ZM5.520 9.198C4.792 9.198 4.081 8.982 3.475 8.577C2.870 8.173 2.398 7.598 2.120 6.926C1.841 6.253 1.768 5.513 1.910 4.799C2.052 4.085 2.403 3.429 2.918 2.915C3.432 2.400 4.088 2.049 4.802 1.907C5.516 1.765 6.256 1.838 6.929 2.117C7.601 2.395 8.176 2.867 8.581 3.472C8.985 4.078 9.201 4.789 9.201 5.517C9.201 6.493 8.813 7.429 8.123 8.120C7.433 8.810 6.496 9.198 5.520 9.198V9.198Z" fill="#52575C"/>'],
    member:['0 0 11.0417 11.0417','<path d="M5.520 0.916C4.627 0.918 3.755 1.179 3.008 1.668C2.262 2.157 1.674 2.852 1.315 3.669C0.957 4.487 0.844 5.390 0.990 6.271C1.136 7.151 1.535 7.970 2.138 8.627C2.569 9.094 3.092 9.467 3.674 9.722C4.256 9.977 4.884 10.108 5.520 10.108C6.155 10.108 6.784 9.977 7.366 9.722C7.948 9.467 8.470 9.094 8.901 8.627C9.504 7.970 9.903 7.151 10.050 6.271C10.196 5.390 10.083 4.487 9.724 3.669C9.366 2.852 8.778 2.157 8.031 1.668C7.285 1.179 6.412 0.918 5.520 0.916V0.916ZM5.520 9.198C4.567 9.196 3.651 8.825 2.966 8.162C3.174 7.656 3.528 7.223 3.983 6.918C4.437 6.614 4.972 6.451 5.520 6.451C6.067 6.451 6.602 6.614 7.057 6.918C7.511 7.223 7.865 7.656 8.073 8.162C7.388 8.825 6.473 9.196 5.520 9.198ZM4.600 4.597C4.600 4.415 4.654 4.237 4.755 4.086C4.856 3.934 4.999 3.816 5.168 3.747C5.336 3.677 5.521 3.659 5.699 3.694C5.878 3.730 6.042 3.818 6.170 3.946C6.299 4.075 6.387 4.239 6.422 4.417C6.458 4.596 6.439 4.781 6.370 4.949C6.300 5.117 6.182 5.261 6.031 5.362C5.880 5.463 5.702 5.517 5.520 5.517C5.276 5.517 5.042 5.420 4.869 5.248C4.697 5.075 4.600 4.841 4.600 4.597ZM8.699 7.357C8.288 6.654 7.655 6.107 6.900 5.802C7.134 5.537 7.287 5.209 7.340 4.859C7.392 4.509 7.343 4.151 7.197 3.828C7.051 3.505 6.816 3.231 6.518 3.039C6.221 2.847 5.874 2.745 5.520 2.745C5.166 2.745 4.819 2.847 4.521 3.039C4.224 3.231 3.988 3.505 3.842 3.828C3.697 4.151 3.647 4.509 3.700 4.859C3.753 5.209 3.905 5.537 4.140 5.802C3.384 6.107 2.752 6.654 2.341 7.357C2.013 6.799 1.840 6.164 1.839 5.517C1.839 4.541 2.227 3.605 2.917 2.915C3.607 2.224 4.544 1.837 5.520 1.837C6.496 1.837 7.432 2.224 8.122 2.915C8.813 3.605 9.200 4.541 9.200 5.517C9.2 6.164 9.026 6.799 8.699 7.357V7.357Z" fill="#52575C"/>'],
    addon:['0 0 11.0417 11.0417','<path d="M9.431 6.946C9.321 6.892 9.195 6.884 9.079 6.922C8.964 6.961 8.868 7.044 8.814 7.153C8.523 7.742 8.080 8.241 7.531 8.600C6.981 8.96 6.346 9.165 5.691 9.197C5.035 9.228 4.383 9.083 3.803 8.778C3.222 8.472 2.733 8.017 2.387 7.459C2.042 6.902 1.851 6.262 1.836 5.606C1.821 4.950 1.981 4.301 2.301 3.728C2.620 3.155 3.087 2.678 3.653 2.346C4.219 2.014 4.864 1.839 5.520 1.840C6.206 1.837 6.879 2.027 7.462 2.389C8.044 2.751 8.513 3.271 8.814 3.887C8.869 3.997 8.965 4.080 9.082 4.119C9.198 4.158 9.325 4.149 9.435 4.094C9.545 4.039 9.628 3.943 9.667 3.826C9.706 3.710 9.697 3.583 9.642 3.473C9.181 2.544 8.418 1.798 7.480 1.357C6.541 0.915 5.481 0.804 4.471 1.041C3.461 1.278 2.561 1.850 1.916 2.663C1.272 3.476 0.921 4.483 0.921 5.520C0.921 6.558 1.272 7.565 1.916 8.378C2.561 9.191 3.461 9.762 4.471 9.999C5.481 10.236 6.541 10.125 7.480 9.684C8.418 9.242 9.181 8.497 9.642 7.568C9.670 7.513 9.686 7.453 9.690 7.393C9.694 7.332 9.686 7.270 9.667 7.213C9.647 7.155 9.616 7.101 9.575 7.056C9.535 7.010 9.486 6.973 9.431 6.946ZM9.661 5.060H5.248L6.307 4.007C6.350 3.964 6.384 3.913 6.407 3.857C6.430 3.801 6.442 3.741 6.442 3.680C6.442 3.619 6.430 3.559 6.407 3.503C6.384 3.447 6.350 3.396 6.307 3.353C6.264 3.310 6.213 3.276 6.157 3.253C6.101 3.230 6.041 3.218 5.980 3.218C5.919 3.218 5.859 3.230 5.803 3.253C5.747 3.276 5.696 3.310 5.653 3.353L3.813 5.194C3.771 5.237 3.738 5.289 3.716 5.345C3.670 5.457 3.670 5.583 3.716 5.695C3.738 5.752 3.771 5.803 3.813 5.847L5.653 7.687C5.696 7.730 5.747 7.764 5.803 7.788C5.859 7.811 5.919 7.823 5.980 7.823C6.041 7.823 6.101 7.811 6.157 7.788C6.213 7.764 6.264 7.730 6.307 7.687C6.350 7.644 6.384 7.593 6.407 7.537C6.431 7.481 6.443 7.421 6.443 7.360C6.443 7.300 6.431 7.240 6.407 7.184C6.384 7.127 6.350 7.077 6.307 7.034L5.248 5.980H9.661C9.783 5.980 9.900 5.932 9.986 5.846C10.072 5.759 10.121 5.642 10.121 5.520C10.121 5.398 10.072 5.281 9.986 5.195C9.900 5.109 9.783 5.060 9.661 5.060Z" fill="#52575C"/>'],
    wallet:['0 0 11.0417 11.0417','<path d="M8.741 3.212H8.281V2.752C8.281 2.386 8.135 2.035 7.876 1.776C7.618 1.517 7.266 1.372 6.900 1.372H2.300C1.934 1.372 1.583 1.517 1.324 1.776C1.065 2.035 0.92 2.386 0.92 2.752V8.273C0.92 8.639 1.065 8.990 1.324 9.249C1.583 9.508 1.934 9.653 2.300 9.653H8.741C9.107 9.653 9.458 9.508 9.717 9.249C9.975 8.990 10.121 8.639 10.121 8.273V4.592C10.121 4.226 9.975 3.875 9.717 3.617C9.458 3.358 9.107 3.212 8.741 3.212ZM2.300 2.292H6.900C7.022 2.292 7.139 2.341 7.226 2.427C7.312 2.513 7.360 2.630 7.360 2.752V3.212H2.300C2.178 3.212 2.061 3.164 1.974 3.078C1.888 2.991 1.840 2.874 1.840 2.752C1.840 2.630 1.888 2.513 1.974 2.427C2.061 2.341 2.178 2.292 2.300 2.292V2.292ZM9.201 6.893H8.741C8.619 6.893 8.502 6.844 8.415 6.758C8.329 6.672 8.281 6.555 8.281 6.433C8.281 6.311 8.329 6.194 8.415 6.107C8.502 6.021 8.619 5.973 8.741 5.973H9.201V6.893ZM9.201 5.053H8.741C8.375 5.053 8.024 5.198 7.765 5.457C7.506 5.716 7.360 6.067 7.360 6.433C7.360 6.799 7.506 7.150 7.765 7.409C8.024 7.668 8.375 7.813 8.741 7.813H9.201V8.273C9.201 8.395 9.152 8.512 9.066 8.598C8.980 8.685 8.863 8.733 8.741 8.733H2.300C2.178 8.733 2.061 8.685 1.974 8.598C1.888 8.512 1.840 8.395 1.840 8.273V4.054C1.987 4.106 2.143 4.133 2.300 4.132H8.741C8.863 4.132 8.980 4.181 9.066 4.267C9.152 4.353 9.201 4.470 9.201 4.592V5.053Z" fill="#52575C"/>'],
    receipt:['0 0 11.0417 11.0417','<g> <path d="M4.140 5.519H3.220C3.098 5.519 2.981 5.567 2.895 5.654C2.808 5.740 2.760 5.857 2.760 5.979C2.760 6.101 2.808 6.218 2.895 6.304C2.981 6.391 3.098 6.439 3.220 6.439H4.140C4.262 6.439 4.379 6.391 4.465 6.304C4.552 6.218 4.600 6.101 4.600 5.979C4.600 5.857 4.552 5.740 4.465 5.654C4.379 5.567 4.262 5.519 4.140 5.519ZM3.680 4.599H5.520C5.642 4.599 5.759 4.550 5.846 4.464C5.932 4.378 5.980 4.261 5.980 4.139C5.980 4.017 5.932 3.900 5.846 3.813C5.759 3.727 5.642 3.679 5.520 3.679H3.680C3.558 3.679 3.441 3.727 3.355 3.813C3.268 3.900 3.220 4.017 3.220 4.139C3.220 4.261 3.268 4.378 3.355 4.464C3.441 4.550 3.558 4.599 3.680 4.599ZM4.140 7.359H3.220C3.098 7.359 2.981 7.408 2.895 7.494C2.808 7.580 2.760 7.697 2.760 7.819C2.760 7.941 2.808 8.058 2.895 8.145C2.981 8.231 3.098 8.279 3.220 8.279H4.140C4.262 8.279 4.379 8.231 4.465 8.145C4.552 8.058 4.600 7.941 4.600 7.819C4.600 7.697 4.552 7.580 4.465 7.494C4.379 7.408 4.262 7.359 4.140 7.359ZM9.661 5.519H8.281V1.378C8.281 1.297 8.260 1.217 8.220 1.147C8.179 1.077 8.121 1.019 8.051 0.978C7.981 0.938 7.901 0.916 7.821 0.916C7.740 0.916 7.661 0.938 7.591 0.978L6.210 1.769L4.830 0.978C4.760 0.938 4.681 0.916 4.600 0.916C4.519 0.916 4.440 0.938 4.370 0.978L2.990 1.769L1.610 0.978C1.540 0.938 1.460 0.916 1.380 0.916C1.299 0.916 1.220 0.938 1.150 0.978C1.079 1.019 1.021 1.077 0.981 1.147C0.940 1.217 0.919 1.297 0.920 1.378V8.739C0.920 9.105 1.065 9.457 1.324 9.715C1.583 9.974 1.934 10.120 2.300 10.120H8.741C9.107 10.120 9.458 9.974 9.717 9.715C9.976 9.457 10.121 9.105 10.121 8.739V5.979C10.121 5.857 10.073 5.740 9.986 5.654C9.900 5.567 9.783 5.519 9.661 5.519ZM2.300 9.199C2.178 9.199 2.061 9.151 1.974 9.065C1.888 8.978 1.840 8.861 1.840 8.739V2.174L2.760 2.699C2.831 2.736 2.910 2.755 2.990 2.755C3.070 2.755 3.149 2.736 3.220 2.699L4.600 1.907L5.980 2.699C6.051 2.736 6.130 2.755 6.210 2.755C6.290 2.755 6.369 2.736 6.440 2.699L7.361 2.174V8.739C7.362 8.896 7.390 9.052 7.443 9.199H2.300ZM9.201 8.739C9.201 8.861 9.152 8.978 9.066 9.065C8.980 9.151 8.863 9.199 8.741 9.199C8.619 9.199 8.502 9.151 8.415 9.065C8.329 8.978 8.281 8.861 8.281 8.739V6.439H9.201V8.739ZM6.238 7.437C6.212 7.420 6.184 7.406 6.155 7.396C6.128 7.382 6.098 7.373 6.068 7.368C5.994 7.354 5.917 7.357 5.845 7.379C5.773 7.400 5.707 7.440 5.654 7.493C5.570 7.581 5.522 7.697 5.520 7.819C5.520 7.879 5.530 7.938 5.552 7.994C5.577 8.050 5.612 8.101 5.654 8.146C5.698 8.187 5.750 8.219 5.806 8.243C5.861 8.267 5.920 8.279 5.980 8.279C6.041 8.279 6.100 8.267 6.155 8.243C6.211 8.219 6.262 8.187 6.307 8.146C6.350 8.103 6.383 8.052 6.406 7.996C6.429 7.940 6.441 7.880 6.440 7.819C6.439 7.697 6.391 7.581 6.307 7.493C6.285 7.473 6.262 7.454 6.238 7.437ZM6.302 5.652C6.249 5.600 6.183 5.562 6.111 5.540C6.039 5.519 5.963 5.516 5.890 5.531C5.816 5.546 5.747 5.579 5.689 5.626C5.632 5.674 5.586 5.735 5.557 5.804C5.528 5.874 5.517 5.950 5.525 6.024C5.532 6.099 5.558 6.171 5.600 6.234C5.642 6.297 5.698 6.348 5.765 6.384C5.831 6.420 5.905 6.439 5.980 6.439C6.102 6.439 6.219 6.391 6.306 6.304C6.392 6.218 6.440 6.101 6.440 5.979C6.440 5.919 6.427 5.859 6.404 5.804C6.381 5.747 6.347 5.695 6.302 5.652V5.652Z" fill="#52575C"/>'],
    link:['0 0 11.0417 11.0417','<path d="M4.327 7.591H3.105C2.556 7.591 2.029 7.373 1.641 6.984C1.253 6.596 1.035 6.069 1.035 5.520C1.035 4.971 1.253 4.445 1.641 4.056C2.029 3.668 2.556 3.450 3.105 3.450H4.300M6.741 3.450H7.936C8.485 3.450 9.011 3.668 9.400 4.056C9.788 4.445 10.006 4.971 10.006 5.520C10.006 6.069 9.788 6.596 9.400 6.984C9.011 7.373 8.485 7.591 7.936 7.591H6.714M3.646 5.520H7.438" stroke-width="1.035" stroke-linecap="round" stroke-linejoin="round" stroke="#52575C"/>'],
    report:['0 0 34.56 34.56','<circle cx="17.28" cy="17.28" r="17.28" fill="#84051B"/> <path d="M15.12 17.28H13.68C13.489 17.28 13.305 17.355 13.170 17.490C13.035 17.625 12.96 17.809 12.96 18C12.96 18.191 13.035 18.374 13.170 18.509C13.305 18.644 13.489 18.72 13.68 18.72H15.12C15.311 18.72 15.494 18.644 15.629 18.509C15.764 18.374 15.84 18.191 15.84 18C15.84 17.809 15.764 17.625 15.629 17.490C15.494 17.355 15.311 17.28 15.12 17.28ZM14.4 15.84H17.28C17.471 15.84 17.654 15.764 17.789 15.629C17.924 15.494 18 15.311 18 15.12C18 14.929 17.924 14.745 17.789 14.610C17.654 14.475 17.471 14.4 17.28 14.4H14.4C14.209 14.4 14.025 14.475 13.890 14.610C13.755 14.745 13.68 14.929 13.68 15.12C13.68 15.311 13.755 15.494 13.890 15.629C14.025 15.764 14.209 15.84 14.4 15.84ZM15.12 20.16H13.68C13.489 20.16 13.305 20.235 13.170 20.370C13.035 20.505 12.96 20.689 12.96 20.88C12.96 21.071 13.035 21.254 13.170 21.389C13.305 21.524 13.489 21.6 13.68 21.6H15.12C15.311 21.6 15.494 21.524 15.629 21.389C15.764 21.254 15.84 21.071 15.84 20.88C15.84 20.689 15.764 20.505 15.629 20.370C15.494 20.235 15.311 20.16 15.12 20.16ZM23.76 17.28H21.6V10.8C21.600 10.673 21.567 10.548 21.504 10.438C21.441 10.328 21.349 10.237 21.24 10.173C21.130 10.110 21.006 10.077 20.88 10.077C20.753 10.077 20.629 10.110 20.52 10.173L18.36 11.412L16.2 10.173C16.090 10.110 15.966 10.077 15.84 10.077C15.713 10.077 15.589 10.110 15.48 10.173L13.32 11.412L11.16 10.173C11.050 10.110 10.926 10.077 10.8 10.077C10.673 10.077 10.549 10.110 10.44 10.173C10.330 10.237 10.239 10.328 10.175 10.438C10.112 10.548 10.079 10.673 10.08 10.8V22.32C10.08 22.892 10.307 23.442 10.712 23.847C11.117 24.252 11.667 24.48 12.24 24.48H22.32C22.892 24.48 23.442 24.252 23.847 23.847C24.252 23.442 24.48 22.892 24.48 22.32V18C24.48 17.809 24.404 17.625 24.269 17.490C24.134 17.355 23.951 17.28 23.76 17.28ZM12.24 23.04C12.049 23.04 11.865 22.964 11.730 22.829C11.595 22.694 11.52 22.511 11.52 22.32V12.045L12.96 12.866C13.071 12.924 13.194 12.954 13.32 12.954C13.445 12.954 13.568 12.924 13.68 12.866L15.84 11.628L18 12.866C18.111 12.924 18.234 12.954 18.36 12.954C18.485 12.954 18.608 12.924 18.72 12.866L20.16 12.045V22.32C20.162 22.565 20.205 22.809 20.289 23.04H12.24ZM23.04 22.32C23.04 22.511 22.964 22.694 22.829 22.829C22.694 22.964 22.511 23.04 22.32 23.04C22.129 23.04 21.945 22.964 21.810 22.829C21.675 22.694 21.6 22.511 21.6 22.32V18.72H23.04V22.32ZM18.403 20.282C18.363 20.255 18.319 20.233 18.273 20.217C18.230 20.195 18.184 20.181 18.136 20.174C18.021 20.151 17.901 20.156 17.788 20.190C17.675 20.224 17.572 20.285 17.488 20.368C17.357 20.506 17.282 20.689 17.28 20.88C17.278 20.973 17.296 21.066 17.330 21.153C17.369 21.241 17.423 21.321 17.488 21.391C17.558 21.454 17.639 21.505 17.726 21.542C17.812 21.580 17.905 21.600 18 21.600C18.094 21.600 18.187 21.580 18.273 21.542C18.360 21.505 18.441 21.454 18.511 21.391C18.577 21.323 18.630 21.244 18.666 21.156C18.702 21.068 18.720 20.974 18.72 20.88C18.717 20.689 18.642 20.506 18.511 20.368C18.477 20.337 18.440 20.309 18.403 20.282ZM18.504 17.488C18.419 17.406 18.317 17.346 18.204 17.313C18.091 17.280 17.973 17.275 17.858 17.299C17.743 17.322 17.635 17.373 17.544 17.448C17.454 17.522 17.383 17.618 17.337 17.726C17.292 17.835 17.275 17.953 17.287 18.071C17.298 18.188 17.339 18.301 17.404 18.399C17.469 18.497 17.558 18.578 17.662 18.634C17.766 18.689 17.882 18.719 18 18.72C18.191 18.72 18.374 18.644 18.509 18.509C18.644 18.374 18.72 18.191 18.72 18C18.718 17.905 18.699 17.813 18.662 17.726C18.627 17.636 18.573 17.555 18.504 17.488V17.488Z" fill="white"/>'],
    dl:['0 0 9.744 9.01291','<path d="M4.872 6.211L4.872 0.432" stroke-width="0.864" stroke-linecap="round" stroke-linejoin="round" stroke="#9E0620"/> <path d="M6.271 4.806L4.872 6.211L3.472 4.806" stroke-width="0.864" stroke-linecap="round" stroke-linejoin="round" stroke="#9E0620"/> <path d="M7.095 2.703H7.543C8.520 2.703 9.312 3.495 9.312 4.472V6.816C9.312 7.791 8.522 8.580 7.548 8.580H2.200C1.224 8.580 0.432 7.788 0.432 6.812V4.467C0.432 3.493 1.222 2.703 2.196 2.703H2.648" stroke-width="0.864" stroke-linecap="round" stroke-linejoin="round" stroke="#9E0620"/>'],
    infoJ:['0 0 14.88 14.88','<path d="M7.44 12.555C10.264 12.555 12.555 10.264 12.555 7.440C12.555 4.615 10.264 2.325 7.44 2.325C4.614 2.325 2.325 4.615 2.325 7.440C2.325 10.264 4.614 12.555 7.44 12.555ZM13.795 7.440C13.795 10.949 10.949 13.795 7.44 13.795C3.929 13.795 1.085 10.949 1.085 7.440C1.085 3.930 3.929 1.085 7.44 1.085C10.949 1.085 13.795 3.930 13.795 7.440ZM7.443 10.413C7.100 10.413 6.823 10.136 6.823 9.793L6.823 7.053C6.823 6.711 7.100 6.433 7.443 6.433C7.785 6.433 8.063 6.711 8.063 7.053L8.063 9.793C8.063 10.136 7.785 10.413 7.443 10.413ZM7.443 5.706C7.785 5.706 8.063 5.429 8.063 5.086C8.063 4.744 7.785 4.466 7.443 4.466L7.436 4.466C7.094 4.466 6.816 4.744 6.816 5.086C6.816 5.429 7.094 5.706 7.436 5.706L7.443 5.706Z" fill-rule="evenodd" clip-rule="evenodd" fill="#52575C"/>']
  };
  function ic(n, w, h, cls){
    var d = I[n];
    return '<svg class="ah-i'+(cls ? ' '+cls : '')+'" viewBox="'+d[0]+'" width="'+w+'" height="'+(h || w)+'" fill="none" aria-hidden="true">'+d[1]+'</svg>';
  }
  var CHECK = '<svg class="ah-i" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M3.5 8.4l2.9 2.9 6.1-6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  var nf = new Intl.NumberFormat('id-ID');

  /* ---------- Phone: AVM home ---------- */
  // Header shape (the darker swoosh on the red navbar / backdrop).
  function swoosh(id, d, x1, y1, x2, y2){
    return '<svg class="ah-swoosh" viewBox="0 0 248.04 96.46" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" gradientUnits="userSpaceOnUse"><stop stop-color="#8A051B"/><stop offset="1" stop-color="#8A051B" stop-opacity="0"/></linearGradient></defs><path d="'+d+'" fill="url(#'+id+')"/></svg>';
  }
  var NAV_SHAPE = swoosh('ah-g1', 'M184.551 95.66C210.775 94.21 237.804 89.983 248.04 88.05V13.407L176.27 25.727L202.494 0H-2.12V40.945C11.107 44.81 45.497 53.627 77.241 57.976C108.986 62.324 143.835 62.686 157.292 62.324L124.513 95.66C133.599 96.264 158.327 97.109 184.551 95.66Z', 220.781, 54.715, -3.545, 4.86);
  var BACK_SHAPE = swoosh('ah-g2', 'M187.733 90.034C213.957 88.654 240.986 84.628 251.223 82.788V11.707L179.452 23.439L205.676 -1.06H1.06V37.931C14.287 41.611 48.677 50.008 80.422 54.148C112.167 58.289 147.017 58.634 160.474 58.289L127.694 90.034C136.78 90.609 161.509 91.414 187.733 90.034Z', 223.964, 51.043, 0.715, -1.06);

  function stat(color, label, pre, value, key, arrow, sub){
    return '<div class="ah-stat"><i style="background:'+color+'"></i><div class="ah-stat__b">'+
      '<span class="ah-stat__l">'+label+'</span>'+
      '<span class="ah-stat__v">'+(pre ? '<small>'+pre+'</small>' : '')+'<b data-n="'+key+'">'+value+'</b>'+
        '<span class="ah-stat__a'+(arrow === 'down' ? ' is-down' : '')+'">'+ic(arrow === 'down' ? 'upRed' : 'upGreen', 8, 6.67)+'</span></span>'+
      '<span class="ah-stat__s">'+sub+S.last+'</span></div></div>';
  }
  function chart(){
    // A steady climb (7.5 → 15 jt; 7.5px per jt, 0 at y 150) drawn as a
    // smooth curve: each segment's handles follow its neighbours (Catmull-Rom).
    var P = [[30,93.8],[82,87],[122,81],[162,75],[202,63],[242,52.5],[296,37.5]];
    var line = 'M' + P[0][0] + ' ' + P[0][1];
    for(var j = 0; j < P.length - 1; j++){
      var a = P[j - 1] || P[j], b = P[j], c = P[j + 1], d = P[j + 2] || c;
      line += 'C' + [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6,
                     c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]]
        .map(function(v){ return +v.toFixed(2); }).join(' ');
    }
    var grid = '', i;
    for(i = 0; i < 5; i++){
      var y = 3 + 30 * i;
      grid += '<span class="ah-ch__gl" style="top:'+y+'px"></span><span class="ah-ch__yl" style="top:'+y+'px">'+(20 - 4 * i)+S.mil+'</span>';
    }
    S.months.forEach(function(m, k){ grid += '<span class="ah-ch__xl" style="left:'+(30 + 40 * k)+'px">'+m+'</span>'; });
    return '<div class="ah-ch" data-el="chart">'+grid+'<span class="ah-ch__ax"></span><span class="ah-ch__base"></span>'+
      '<svg class="ah-ch__svg" viewBox="0 0 296 169" aria-hidden="true">'+
        '<defs><linearGradient id="ah-g3" x1="0" y1="-21" x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop stop-color="#9E0620"/><stop offset="1" stop-color="#C4C4C4" stop-opacity="0"/></linearGradient></defs>'+
        '<path class="ah-ch__fill" d="'+line+'L296 150L30 150Z" fill="url(#ah-g3)"/>'+
        '<path class="ah-ch__line" d="'+line+'" pathLength="1" fill="none" stroke="#9E0620" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
        '<g class="ah-ch__sel">'+
          '<path d="M162 75V150" stroke="#9E0620" stroke-dasharray="2 2"/>'+
          '<circle cx="162" cy="75" r="12" fill="none" stroke="#9E0620" stroke-opacity=".15"/>'+
          '<circle cx="162" cy="75" r="6.5" fill="#fff" stroke="#9E0620" stroke-width="2"/>'+
          '<path transform="translate(169 50) scale(1.449)" opacity=".85" fill="#25282B" d="M70.392 0C72.678 0 74.532 1.854 74.532 4.141V30.364C74.532 32.651 72.678 34.505 70.392 34.505H6.902C4.616 34.505 2.762 32.651 2.762 30.364V19.651C1.993 19.259.886 18.521.397 18.003C.392 17.998.234 17.844.165 17.748C.055 17.607 0 17.433 0 17.259C0 17.064.062 16.883.179 16.735C.206 16.709.308 16.594.404 16.5C.872 16.01 1.965 15.262 2.762 14.854V4.141C2.762 1.854 4.616 0 6.902 0H70.392Z"/>'+
          '<text x="183" y="68" class="ah-ch__t1">July 2021</text><text x="183" y="84" class="ah-ch__t2">Rp10.000.000</text>'+
        '</g></svg></div>';
  }
  // [accent, from, to, name, court, day, icons, dot]
  var ROWS = [
    ['#00c48c','10:00','12:00','Gilang Kencana','Interlock', S.tue+', 19 Sep 2024', ['check','member']],
    ['#00c48c','10:00','12:00','Budiman Mustofa', S.grass, S.tue+', 19 Sep 2024', ['addon']],
    ['#fcb145','12:00','14:00','Kevin Halim', S.grass, S.tue+', 19 Sep 2024', ['wallet']],
    ['#fcb145','16:00','18:00','Leo Adriansyah','Interlock', S.tue+', 19 Sep 2024', ['receipt','addon']],
    ['#a0a4a8','18:00','20:00','Narpati Lukita','Interlock', S.tue+', 19 Sep 2024', ['link'], true],
    ['#a0a4a8','10:00','12:00','Kemal Halim', S.grass, S.wed+', 20 Sep 2024', ['link']]
  ];
  function row(r){
    return '<div class="ah-row"><i class="ah-row__acc" style="background:'+r[0]+'"></i><div class="ah-row__in">'+
      '<div class="ah-row__t"><span>'+r[1]+'</span><em>-</em><span>'+r[2]+'</span></div><i class="ah-row__div"></i>'+
      '<div class="ah-row__b"><div class="ah-row__top"><span>'+r[3]+'</span><span class="ah-row__ics">'+
        r[6].map(function(n){ return ic(n, 16, 16, n === 'addon' ? 'ah-rot' : ''); }).join('')+'</span></div>'+
      '<span class="ah-row__s">'+r[4]+' · '+r[5]+'</span></div></div>'+(r[7] ? '<i class="ah-row__dot"></i>' : '')+'</div>';
  }
  function phone(){
    return '<div class="ah-phone"><div class="ah-screen" data-el="screen"><div class="ah-app">'+
      '<div class="ah-scroll" data-el="scroll">'+
        '<div class="ah-back">'+BACK_SHAPE+'</div>'+
        '<div class="ah-main" data-el="main">'+
          '<div class="ah-card ah-info"><div class="ah-card__h"><span>'+S.venue+'</span><span class="ah-badge">'+S.open+'</span></div><i class="ah-dash"></i>'+
            '<div class="ah-info__r"><div class="ah-info__bal"><span class="ah-info__ic">'+ic('money', 20)+'</span><span><small>'+S.balance+'</small><b>Rp56.000.000</b></span></div>'+
            '<span class="ah-link">'+S.detail+ic('arrowR', 20)+'</span></div></div>'+
          '<div class="ah-card ah-stats"><div class="ah-card__h"><span>'+S.stats+'</span></div><i class="ah-dash"></i>'+
            '<div class="ah-stats__row" data-el="stats">'+
              stat('#9e0620', S.rev, 'Rp', '106.785.000', 'rev', 'down', '-7%')+
              stat('#f18701', S.res, '', '243', 'res', 'up', '+24%')+
              stat('#009fb7', S.occ, '', '88%', 'occ', 'up', '+14%')+
            '</div>'+chart()+'<span class="ah-link">'+S.detail+ic('arrowR', 20)+'</span></div>'+
          '<div class="ah-band"><i></i></div>'+
          '<div class="ah-list" data-el="list"><div class="ah-list__h"><span>'+S.upcoming+'</span>'+ic('info', 16)+'</div>'+ROWS.map(row).join('')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="ah-nav">'+NAV_SHAPE+'<div class="ah-nav__bar"><div class="ah-nav__t"><span>AYO Arena Jakarta</span>'+ic('chevW', 20)+'<b>12</b></div>'+
        '<span class="ah-nav__a">'+ic('paper', 20)+ic('bell', 20)+'</span></div></div>'+
    '</div><span class="ah-cover" data-el="cover"></span></div></div>';
  }

  /* ---------- Floating feature cards ---------- */
  function tag(t){ return '<span class="ah-tag">'+esc(t)+'</span>'; }
  function fund(){
    return '<div class="ah-f ah-f--fund"><div class="ah-f__in">'+tag(S.fundTag)+
      '<div class="ah-win"><div class="ah-ui">'+
        '<i class="ah-dots"></i>'+
        '<div class="ah-fund"><span class="ah-fund__l">'+S.balance+'</span><b class="ah-fund__v">Rp<span data-n="fund">19.250.000</span></b>'+
        '<span class="ah-btn" data-el="withdraw"><span class="ah-btn__a">'+S.withdraw+'</span><span class="ah-btn__b">'+CHECK+S.withdrawn+'</span></span></div>'+
      '</div></div></div></div>';
  }
  function chip(label, key){
    return '<span class="ah-chip" data-el="'+key+'"><span class="ah-chip__ic">'+ic('dl', 12.5, 11.6, 'ah-chip__dl')+'<i class="ah-spin"></i>'+CHECK+'</span>'+label+'</span>';
  }
  function report(){
    return '<div class="ah-f ah-f--rep"><div class="ah-f__in">'+tag(S.repTag)+
      '<div class="ah-win"><div class="ah-ui"><div class="ah-rep">'+
        '<div class="ah-rep__h"><span><small>'+S.total+'</small><b>Rp15.000.000</b></span>'+ic('report', 48)+'</div>'+
        '<div class="ah-rep__cta">'+chip('PDF', 'pdf')+chip('Excel', 'xls')+'</div>'+
      '</div></div></div></div></div>';
  }
  function cross(cls, w, h, sw, label){
    return '<div class="ah-x '+cls+'"><svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L'+w+' '+h+'M0 '+h+'L'+w+' 0" stroke="#e8e8e8" stroke-width="'+sw+'" stroke-linecap="round"/></svg>'+
      (label ? '<span>'+S.linked[0]+'<br>'+S.linked[1]+'</span>' : '')+'</div>';
  }
  function block(cls, color, bg, name, time, icon){
    return '<div class="ah-bk '+cls+'" style="background:'+bg+'"><i style="background:'+color+'"></i><b>'+name+'</b><span>'+time+'</span>'+ic(icon, 16)+'</div>';
  }
  function schedule(){
    return '<div class="ah-f ah-f--sch"><div class="ah-f__in">'+tag(S.schTag)+
      '<div class="ah-win"><div class="ah-ui ah-day">'+
        '<i class="ah-day__tbg"></i><i class="ah-v" style="left:72px"></i><i class="ah-v" style="left:201px"></i><i class="ah-v" style="left:330px"></i>'+
        '<i class="ah-h" style="top:40px;left:0;width:360px"></i>'+
        '<i class="ah-h" style="top:113px;left:0;width:72px"></i><i class="ah-h" style="top:186px;left:0;width:72px"></i>'+
        '<i class="ah-h" style="top:186px;left:73px;width:128px"></i>'+
        '<i class="ah-h" style="top:113px;left:202px;width:158px"></i><i class="ah-h" style="top:186px;left:202px;width:158px"></i>'+
        '<span class="ah-day__info">'+ic('infoJ', 24)+'</span>'+
        '<span class="ah-day__c" style="left:136.5px">'+S.football+'</span><span class="ah-day__c" style="left:265.5px">Mini Soccer</span>'+
        '<span class="ah-day__t" style="top:54px">06:00</span><span class="ah-day__t" style="top:127px">07:00</span><span class="ah-day__t" style="top:200px">08:00</span>'+
        block('ah-bk--dipo', '#fcb145', 'rgba(252,177,69,.1)', 'Dipo Soputan', '06:00 - 08:00', 'receipt')+
        cross('ah-x--m6', 112, 56, 1.1, true)+cross('ah-x--m7', 112, 56, 1.1, true)+
        cross('ah-x--s8', 112, 129, 2.2, true)+
        block('ah-bk--yogi', '#00c48c', '#e3f6f1', 'Yogi Rahadian', '08:00 - 09:00', 'link')+
      '</div></div></div></div>';
  }
  function role(name, text, on, key){
    return '<div class="ah-role"><div class="ah-role__t"><span class="ah-radio'+(on ? ' is-on' : '')+'" data-el="'+key+'"></span><b>'+name+'</b></div>'+
      '<p>'+text+'</p><span class="ah-role__more">'+S.more+'<svg class="ah-i" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M8 11l3.3 3.3c.4.4 1 .4 1.4 0L16 11" stroke="#9E0620" stroke-width="1.5" stroke-linecap="round"/></svg></span></div>';
  }
  function staff(){
    return '<div class="ah-f ah-f--stf"><div class="ah-f__in">'+tag(S.stfTag)+
      '<div class="ah-win"><div class="ah-ui ah-stf"><b class="ah-stf__h">'+S.rights+'</b>'+
        role('Manager', S.manager, false, 'r-manager')+role('Staff', S.staff, true, 'r-staff')+
      '</div></div></div></div>';
  }

  mount.classList.add('avm-hero');
  mount.setAttribute('role', 'img');
  mount.setAttribute('aria-label', S.label);
  mount.innerHTML = '<div class="ah-art" aria-hidden="true">'+phone()+fund()+report()+schedule()+staff()+'</div>';
  var art = mount.querySelector('.ah-art');
  function el(n){ return art.querySelector('[data-el="'+n+'"]'); }
  function pre(sel, on){ sel.forEach(function(q){ art.querySelector(q).classList.toggle('is-pre', on); }); }
  function num(n){ return art.querySelector('[data-n="'+n+'"]'); }
  var floats = [].slice.call(art.querySelectorAll('.ah-f'));

  /* ---------- Fit: composition by container width, scaled like scoring.js --hs ---------- */
  var mobile = false;
  function fit(){
    var w = mount.clientWidth; if(!w) return;
    if(w === fit.w) return; fit.w = w;
    mobile = w < 560;
    var aw = mobile ? 360 : 660, s = Math.min(1, w / aw);
    mount.classList.toggle('is-m', mobile);
    art.style.setProperty('--hs', s);
    art.style.left = Math.max(0, (w - aw * s) / 2) + 'px';
    mount.style.height = Math.round(560 * s) + 'px';
  }
  fit();
  if('ResizeObserver' in window) new ResizeObserver(fit).observe(mount);
  else { var rt; addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(fit, 100); }); }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)){ floats.forEach(function(f){ f.firstChild.classList.add('is-in'); }); return; }

  /* ---------- Motion ---------- */
  mount.classList.add('is-motion');
  var run = 0, STOP = {};
  function wait(id, ms){ return new Promise(function(res, rej){ setTimeout(function(){ id === run ? res() : rej(STOP); }, ms); }); }
  function quiet(e){ if(e !== STOP) throw e; }
  function visible(f){ return getComputedStyle(f).display !== 'none'; }

  // Count a number up (or down) with an ease-out; f formats the value.
  // The frames only paint; a timer ends the count, so the flow never waits
  // on requestAnimationFrame (paused in background tabs).
  function count(id, node, from, to, ms, f){
    var t0 = performance.now(), done = false;
    (function tick(now){
      if(done || id !== run) return;
      var k = Math.max(0, Math.min(1, (now - t0) / ms)), e = 1 - Math.pow(1 - k, 3);
      node.textContent = f(from + (to - from) * e);
      if(k < 1) requestAnimationFrame(tick);
    })(t0);
    return wait(id, ms).then(function(){ done = true; node.textContent = f(to); });
  }
  var money = function(v){ return nf.format(Math.round(v / 1000) * 1000); };

  // Touch marker: appears ON the element, presses, lifts; it never travels.
  // Resolves at the press, so the effect happens with the touch.
  function tap(id, target){
    var host = target.closest('.ah-f__in') || el('screen');
    var mk = host.querySelector(':scope > .ah-tap');
    if(!mk){ mk = document.createElement('span'); mk.className = 'ah-tap'; host.appendChild(mk); }
    var hb = host.getBoundingClientRect(), tb = target.getBoundingClientRect(), k = hb.width / host.offsetWidth || 1;
    mk.className = 'ah-tap';
    mk.style.left = ((tb.left + tb.width / 2 - hb.left) / k) + 'px';
    mk.style.top = ((tb.top + tb.height / 2 - hb.top) / k) + 'px';
    mk.offsetHeight; mk.classList.add('is-on');
    return wait(id, 160).then(function(){
      mk.classList.add('is-down');
      setTimeout(function(){ mk.classList.remove('is-down', 'is-on'); }, 260);
    });
  }

  var scroller = el('scroll'), main = el('main'), list = el('list');
  function scrollTo(id, y, ms){
    scroller.style.transitionDuration = ms + 'ms';
    scroller.style.transform = 'translateY(' + (-y) + 'px)';
    return wait(id, ms + 120);
  }
  // Bottom of the home screen against the bottom of the visible screen
  // (app px: the screen is 528.28px tall at .690104, the app starts 11.46px up).
  function maxY(){ return Math.max(0, main.offsetTop + main.offsetHeight - (528.28 + 11.46) / 0.690104); }

  // Opening state of every loop (the static Figma frame is the end state).
  function reset(){
    art.classList.add('no-anim');
    floats.forEach(function(f){ f.firstChild.classList.remove('is-in'); });
    scroller.style.transitionDuration = '0ms'; scroller.style.transform = 'translateY(0)';
    el('chart').setAttribute('data-s', '0');
    el('stats').style.transitionDuration = '0ms'; el('stats').style.transform = '';
    num('rev').textContent = '0'; num('res').textContent = '0'; num('occ').textContent = '0%';
    num('fund').textContent = '19.250.000';
    el('withdraw').classList.remove('is-done', 'is-press');
    ['pdf', 'xls'].forEach(function(k){ el(k).classList.remove('is-busy', 'is-done'); });
    pre(['.ah-bk--dipo', '.ah-x--m6', '.ah-x--m7', '.ah-bk--yogi', '.ah-x--s8'], true);
    el('r-manager').classList.remove('is-on'); el('r-staff').classList.add('is-on');
    art.offsetHeight; art.classList.remove('no-anim');
  }

  function play(id){
    var cover = el('cover');
    var order = floats.filter(visible);
    return wait(id, 250).then(function(){
      // Cards enter one by one.
      order.forEach(function(f, i){ setTimeout(function(){ if(id === run) f.firstChild.classList.add('is-in'); }, 150 + i * 220); });
      // Statistics: the line draws, the numbers count, then fill + July point.
      el('chart').setAttribute('data-s', '1');
      count(id, num('rev'), 0, 106785000, 1300, money).catch(quiet);
      count(id, num('res'), 0, 243, 1300, function(v){ return String(Math.round(v)); }).catch(quiet);
      count(id, num('occ'), 0, 88, 1300, function(v){ return Math.round(v) + '%'; }).catch(quiet);
      return wait(id, 1300);
    }).then(function(){
      el('chart').setAttribute('data-s', '2');
      return wait(id, 700);
    }).then(function(){
      // Statistics row: swipe left to the tiles past the card's edge, then back.
      var row = el('stats'), dx = row.scrollWidth - row.clientWidth;
      row.style.transitionDuration = '900ms'; row.style.transform = 'translateX(' + (-dx) + 'px)';
      return wait(id, 900 + 1100).then(function(){
        row.style.transform = 'translateX(0)';
        return wait(id, 900 + 300);
      });
    }).then(function(){
      // Fund withdrawal: tap → success, balance runs down to 0.
      var b = el('withdraw');
      return tap(id, b).then(function(){
        b.classList.add('is-press');
        return wait(id, 180);
      }).then(function(){
        b.classList.remove('is-press'); b.classList.add('is-done');
        return count(id, num('fund'), 19250000, 0, 900, money);
      });
    }).then(function(){
      return wait(id, 500);
    }).then(function(){
      // Phone: down through the dashboard to the upcoming schedule.
      var p = scrollTo(id, maxY(), 2400);
      // Meanwhile the Excel chip is tapped and downloads.
      wait(id, 700).then(function(){ return tap(id, el('xls')); })
        .then(function(){ el('xls').classList.add('is-busy'); return wait(id, 1000); })
        .then(function(){ var c = el('xls'); c.classList.remove('is-busy'); c.classList.add('is-done'); })
        .catch(quiet);
      return p;
    }).then(function(){
      if(mobile) return wait(id, 1400);
      // Connected courts, no touch: the yellow Football booking lands and
      // blocks the linked Mini Soccer hours, then the green Mini Soccer
      // booking lands and blocks the linked Football hour.
      return wait(id, 300).then(function(){ pre(['.ah-bk--dipo'], false); return wait(id, 450); })
        .then(function(){ pre(['.ah-x--m6', '.ah-x--m7'], false); return wait(id, 900); })
        .then(function(){ pre(['.ah-bk--yogi'], false); return wait(id, 450); })
        .then(function(){ pre(['.ah-x--s8'], false); return wait(id, 900); })
        // Staff access: pick the Manager role.
        .then(function(){ return tap(id, el('r-manager')); })
        .then(function(){ el('r-manager').classList.add('is-on'); el('r-staff').classList.remove('is-on'); return wait(id, 900); });
    }).then(function(){
      return scrollTo(id, 0, 1800);
    }).then(function(){
      return wait(id, 2200);
    }).then(function(){
      // Fade out (cards leave, screen goes white), reset, start again.
      order.forEach(function(f){ f.firstChild.classList.remove('is-in'); });
      cover.classList.add('is-on');
      return wait(id, 450);
    }).then(function(){
      reset();
      return wait(id, 120);
    }).then(function(){
      cover.classList.remove('is-on');
      return wait(id, 350);
    }).then(function(){ return play(id); });
  }

  function start(){ var id = ++run; mount.classList.add('is-live'); reset(); play(id).catch(function(e){ if(e !== STOP) throw e; }); }
  function stop(){ run++; mount.classList.remove('is-live'); el('cover').classList.remove('is-on'); reset(); }
  reset();
  var live = false;
  new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && !live){ live = true; start(); }
      else if(!e.isIntersecting && live){ live = false; stop(); }
    });
  }, {threshold:.25}).observe(mount);
})();
