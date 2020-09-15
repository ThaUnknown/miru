if ((typeof halfmoon === "object" || typeof halfmoon === 'function') && (halfmoon !== null)) {
    halfmoon.showModal = id => {
        const t = document.getElementById(id)
        t && t.classList.add("show")
    }
    halfmoon.hideModal = id => {
        const t = document.getElementById(id)
        t && t.classList.remove("show")
    }
}

