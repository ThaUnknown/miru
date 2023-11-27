<nav class='navbar flex-column bg-transparent border-0 d-flex'>
  <div class='container p-0'>
    <a href='/' class='navbar-brand ml-20'>
      <img src='/logo.ico' alt='Logo' />
    </a>
    <ul class='navbar-nav d-flex ml-auto'>
      <li class='nav-item mr-10'>
        <a href='/features' class='nav-link'>Features</a>
      </li>
      <li class='nav-item mr-10'>
        <a href='/download' class='nav-link'>Download</a>
      </li>
    </ul>
    <a href='https://github.com/sponsors/ThaUnknown/' class='navbar-link navbar-link-with-icon pointer overflow-hidden donate mr-20 h-full' target='_blank'>
      <span class='material-symbols-outlined rounded filled font-size-20 h-full'>favorite</span>
    </a>
    <hr class='m-0 w-full position-absolute bottom-0 w-full' />
  </div>
</nav>

<style>
  :root {
    --navbar-brand-image-height: 6rem;
    --navbar-height: 7rem !important;
  }
  .navbar {
    backdrop-filter: blur(8px);
  }
  @keyframes glow {
    from {
      text-shadow: 0 0 2rem #fa68b6;
    }
    to {
      text-shadow: 0 0 1rem #fa68b6;
    }
  }
  .donate .material-symbols-outlined {
    width: 5.4rem;
    animation: glow 1s ease-in-out infinite alternate;
    font-variation-settings: 'FILL' 1;
    color: #fa68b6;
    text-shadow: 0 0 1rem #fa68b6;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
</style>
