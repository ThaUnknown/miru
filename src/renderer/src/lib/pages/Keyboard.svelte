<div class="d-flex flex-column w-820 p-10 rounded">
  <div class="row">
    <div><div class="material-icons bg-dark">help_outline</div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div class="w-100"><div class="bg-dark"></div></div>
    <div><div class="bg-dark"></div></div>
  </div>
  <div class="row">
    <div class="w-75"><div class="bg-dark"></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div>-90</div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div class="material-icons">list</div></div>
    <div><div></div></div>
    <div><div class="material-icons">picture_in_picture</div></div>
    <div><div class="material-icons">history</div></div>
    <div><div class="material-icons shadow-lg">update</div></div>
    <div class="w-75"><div class="material-icons bg-dark">schedule</div></div>
    <div><div class="bg-dark"></div></div>
  </div>
  <div class="row">
    <div class="w-90"><div class="bg-dark"></div></div>
    <div><div></div></div>
    <div><div>+90</div></div>
    <div><div class="material-icons">cast</div></div>
    <div><div class="material-icons">fullscreen</div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div class="w-110"><div class="bg-dark"></div></div>
    <div><div class="bg-dark"></div></div>
  </div>
  <div class="row">
    <div class="w-115"><div class="bg-dark"></div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div class="material-icons">subtitles</div></div>
    <div><div></div></div>
    <div><div></div></div>
    <div><div class="material-icons">skip_next</div></div>
    <div><div class="material-icons">volume_off</div></div>
    <div><div class="material-icons">fast_rewind</div></div>
    <div><div class="material-icons">fast_forward</div></div>
    <div><div></div></div>
    <div class="w-85"><div class="bg-dark"></div></div>
    <div><div class="material-icons bg-dark">volume_up</div></div>
    <div><div class="bg-dark"></div></div>
  </div>
  <div class="row">
    <div class="w-75"><div class="bg-dark"></div></div>
    <div><div class="bg-dark"></div></div>
    <div class="w-75"><div class="bg-dark"></div></div>
    <div class="w-300"><div class="material-icons bg-dark">play_arrow</div></div>
    <div class="w-75"><div class="bg-dark"></div></div>
    <div class="w-75"><div class="bg-dark"></div></div>
    <div><div class="bg-dark">-2</div></div>
    <div><div class="material-icons bg-dark">volume_down</div></div>
    <div><div class="bg-dark">+2</div></div>
  </div>
</div>

<style>
  .material-icons, .row > div > div {
    font-size: 1.8rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .material-icons {
    font-size: 2.2rem !important;
    font-weight: unset !important;
  }
  .row > div {
    height: 5rem;
    width: 5rem;
    padding: 0.5rem;
    transition: transform 0.2s ease;
  }
  .row > div:hover {
    transform: scale(0.9);
  }
  .row > div > div {
    background-color: var(--dark-color-light);
    height: 100%;
    border-radius: var(--base-border-radius) !important;
  }
  .w-75 {
    width: 7.5rem !important;
  }
  .w-85 {
    width: 8.5rem !important;
  }
  .w-90 {
    width: 9rem !important;
  }
  .w-110 {
    width: 11rem !important;
  }
  .w-115 {
    width: 11.5rem !important;
  }
  .w-820 {
    width: 82rem;
    animation: .3s ease 0s 1 load-in;
    background: rgba(0, 0, 0, 0.8)
  }
  @keyframes load-in {
    from {
        bottom: -1.2rem;
        transform: scale(.75);
    }

    to {
        bottom: 0;
        transform: scale(1);
    }
}
</style>
