// js/recomendacoes.js
// Renderiza recomendações dinâmicas na seção #recomendacoes do produto.html

async function renderRecomendacoes() {
  const sec = document.getElementById('recomendacoes');
  if (!sec) return;
  // Limpa conteúdo antigo
  sec.innerHTML = `<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">Você também pode gostar</h3>`;

  let produtos = [];
  async function tentarCarregar(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      return Array.isArray(data) ? data : (data.produtos || data.items || null);
    } catch (e) {
      return null;
    }
  }
  // tenta múltiplos caminhos até achar
  const tentativas = [
    './produtos.json',
    'produtos.json',
    '/landings/modelo/produtos.json'
  ];
  for (const u of tentativas) {
    const resultado = await tentarCarregar(u);
    if (resultado) { produtos = resultado; break; }
  }
  if (!Array.isArray(produtos) || produtos.length === 0) {
    sec.innerHTML += '<div style="text-align:center;color:#999;">Não foi possível carregar recomendações.</div>';
    return;
  }
  // Descobre o produto atual pela URL
  const params = new URLSearchParams(window.location.search);
  const produtoId = params.get('produto_id') || params.get('id') || null;
  // Filtra para não mostrar o próprio produto
  let recomendados = produtos.filter(p => String(p.id) !== String(produtoId));
  // Fallback: se vazio, usa primeiros produtos (até 6) ignorando filtro
  if (!recomendados.length) {
    recomendados = produtos.slice(0, 6);
  }
  // ----- Novo estilo mini quadrado (sem empilhar grande) -----
  // Injeta CSS apenas uma vez
  if (!document.getElementById('reco-mini-style')) {
    const st = document.createElement('style');
    st.id = 'reco-mini-style';
    st.textContent = `
      .reco-mini-wrap {display:grid;grid-template-columns:repeat(2,1fr);gap:10px;justify-content:stretch;padding:4px 8px 12px 8px;width:100%;}
      .reco-mini-card {width:100%;display:flex;flex-direction:column;cursor:pointer;background:#fff;border:1px solid #f1f1f1;box-shadow:0 2px 6px #00000010;position:relative;border-radius:10px;overflow:hidden;}
      .reco-mini-card .img-box {width:100%;position:relative;display:block;overflow:hidden;border-radius:0;background:#fff;}
      .reco-mini-card .img-box img {width:100%;height:auto;display:block;object-fit:contain;margin:0 auto;}
      .reco-mini-card .content {display:flex;flex-direction:column;padding:8px 8px 10px 8px;gap:5px;}
      .reco-mini-card .titulo {font-size:12px;font-weight:600;color:#222;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .reco-mini-card .preco-row {display:flex;flex-wrap:wrap;align-items:center;gap:5px;}
      .reco-mini-card .preco-row span {flex-shrink:0;}
      .reco-mini-card .preco-atual {font-size:13px;font-weight:700;color:#ff2d55;line-height:1;}
      .reco-mini-card .preco-original {font-size:11px;color:#999;text-decoration:line-through;line-height:1;}
      .reco-mini-card .badge-desconto {font-size:10px;font-weight:600;color:#ff2d55;background:#ffe4ee;border-radius:4px;padding:2px 4px;line-height:1;display:inline-block;}
      .reco-mini-card .coupon {display:flex;align-items:center;gap:4px;font-size:10px;color:#ff2d55;font-weight:600;background:#fff;}
      .reco-mini-card .coupon img {width:14px;height:14px;display:block;filter: brightness(0) saturate(100%) invert(35%) sepia(96%) saturate(3284%) hue-rotate(329deg) brightness(99%) contrast(101%);}
      .reco-mini-card .promo-row {display:flex;align-items:center;gap:4px;flex-wrap:nowrap;}
      .reco-mini-card .shipping {font-size:10px;font-weight:600;color:#00bfae;background:#e0f7fa;border-radius:5px;padding:2px 5px;display:inline-block;line-height:1;white-space:nowrap;}
      .reco-mini-card .rating-row {display:flex;align-items:center;gap:5px;font-size:10px;color:#555;flex-wrap:nowrap;}
      .reco-mini-card .rating-row .star svg {width:12px;height:12px;fill:#ffc107;display:block;}
      .reco-mini-card .rating-row .rating-val {font-weight:600;}
      .reco-mini-card .rating-row .sep {display:inline-block;width:1px;height:12px;background:#ccc;margin:0 2px;border-radius:1px;}
      .reco-mini-card .vendidos {font-size:10px;color:#888;font-weight:500;}
    `;
    document.head.appendChild(st);
  }
  const grid = document.createElement('div');
  grid.className = 'reco-mini-wrap';
  recomendados.slice(0, 6).forEach(produto => {
    const card = document.createElement('div');
    card.className = 'reco-mini-card';
    card.onclick = () => {
      window.location.href = `produto.html?produto_id=${encodeURIComponent(produto.id)}`;
    };
    const precoValor = (typeof produto.preco === 'number') ? produto.preco : parseFloat(String(produto.preco||'0').replace(',','.')) || 0;
    const preco = precoValor.toFixed(2).replace('.',',');
    const descontoVal = produto.desconto != null ? parseFloat(String(produto.desconto).replace('%','')) : null;
    const descontoFmt = (descontoVal != null && !isNaN(descontoVal)) ? Math.round(descontoVal) : null;
    // Deriva preço original se houver desconto
    const precoOriginalValor = (descontoFmt != null && descontoFmt > 0) ? (precoValor / (1 - (descontoFmt/100))) : null;
    const precoOriginal = precoOriginalValor ? precoOriginalValor.toFixed(2).replace('.',',') : null;
    const tituloBase = produto.titulo || produto.nome || produto.descricao || 'Produto';
    const rating = produto.rating || produto.avaliacao || produto.nota || 4.7;
    const vendidos = produto.vendidos || produto.quantidade_produtos || produto.quantidade || 0;
    card.innerHTML = `
      <div class="img-box">
        <img src="${(produto.fotos && produto.fotos[0]) || 'https://via.placeholder.com/150x150?text=Produto'}" alt="Produto">
      </div>
      <div class="content">
        <div class="titulo">${tituloBase}</div>
        <div class="preco-row">
          <span class="preco-atual">R$ ${preco}</span>
          ${precoOriginal ? `<span class="preco-original">R$ ${precoOriginal}</span>` : ''}
        </div>
        <div class="promo-row">
          ${descontoFmt !== null ? `<div class="coupon"><img src="/uploads/bilhete.png" alt="Cupom"><span>${descontoFmt}% OFF</span></div>` : ''}
          <span class="shipping">frete grátis</span>
        </div>
        <div class="rating-row">
          <span class="star"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
          <span class="rating-val">${rating.toFixed(1)}</span>
          <span class="sep"></span>
          <span class="vendidos">${vendidos} vendidos</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  sec.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', renderRecomendacoes);