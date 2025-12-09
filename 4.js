function formatDateBR(iso) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

function renderPosts(posts) {
  const container = document.getElementById("posts");
  const search = document.getElementById("search");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  let data = posts.slice().sort((a,b) => (a.date < b.date ? 1 : -1));

  function draw(list) {
    container.innerHTML = list.map(p => `
      <article class="card">
        <h3><a class="btn" href="${p.url}" target="_blank" rel="noopener">Ler: ${p.title}</a></h3>
        <p class="meta">${formatDateBR(p.date)} • Fonte: ${p.source}</p>
        <p>${p.summary}</p>
        <div class="tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      </article>
    `).join("");
  }

  draw(data);

  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase().trim();
      if (!q) return draw(data);
      const filtered = data.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q)
      );
      draw(filtered);
    });
  }
}

function renderAIs(ais) {
  const container = document.getElementById("ais");
  const filtro = document.getElementById("filtro-categoria");
  const search = document.getElementById("search-ais");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // popular categorias
  const categorias = Array.from(new Set(ais.map(a => a.categoria))).sort();
  categorias.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    filtro.appendChild(opt);
  });

  function draw(list) {
    container.innerHTML = list.map(a => `
      <article class="card">
        <h3>${a.nome}</h3>
        <p class="meta">${a.empresa} • ${a.categoria}</p>
        <p>${a.resumo}</p>
        <div class="tags">
          ${a.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
        <a class="btn alt" href="${a.site}" target="_blank" rel="noopener">Site oficial</a>
      </article>
    `).join("");
  }

  let data = ais.slice().sort((a,b) => a.nome.localeCompare(b.nome));
  draw(data);

  function filtrar() {
    const c = filtro.value;
    const q = (search.value || "").toLowerCase().trim();
    let list = data;
    if (c) list = list.filter(a => a.categoria === c);
    if (q) {
      list = list.filter(a =>
        a.nome.toLowerCase().includes(q) ||
        a.empresa.toLowerCase().includes(q) ||
        a.tags.join(" ").toLowerCase().includes(q)
      );
    }
    draw(list);
  }

  filtro.addEventListener("change", filtrar);
  search.addEventListener("input", filtrar);
}

// bootstrap por página
document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;

  try {
    if (page === "home") {
      const res = await fetch("posts.json");
      const posts = await res.json();
      renderPosts(posts);
    } else if (page === "guia") {
      const res = await fetch("ais.json");
      const ais = await res.json();
      renderAIs(ais);
    }
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
    alert("Não foi possível carregar o conteúdo. Verifique se os arquivos JSON estão no mesmo diretório ou publique o site para testar online.");
  }
});
