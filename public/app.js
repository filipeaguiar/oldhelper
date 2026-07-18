import { firebaseConfig } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const dom = {
  landing: $('landing'), app: $('app'), toast: $('toast'), connectionBadge: $('connectionBadge'),
  installBanner: $('installBanner'), installBtn: $('installBtn'), dismissInstallBtn: $('dismissInstallBtn'),
  installDescription: $('installDescription'),
  displayName: $('displayName'), userRole: $('userRole'), createForm: $('createForm'), joinForm: $('joinForm'),
  campaignName: $('campaignName'), joinCode: $('joinCode'),
  campaignTitle: $('campaignTitle'), campaignCode: $('campaignCode'), syncStatus: $('syncStatus'),
  copyCodeBtn: $('copyCodeBtn'), leaveBtn: $('leaveBtn'), settingsBtn: $('settingsBtn'),
  summary: $('summary'), walletSummary: $('walletSummary'), alertsSummary: $('alertsSummary'),
  searchInput: $('searchInput'), categoryFilter: $('categoryFilter'), containerFilter: $('containerFilter'),
  bulkTransferBtn: $('bulkTransferBtn'), addItemBtn: $('addItemBtn'), inventory: $('inventory'),
  rationForm: $('rationForm'), rationDays: $('rationDays'), rationMargin: $('rationMargin'), rationPrice: $('rationPrice'),
  rationCurrency: $('rationCurrency'), rationParticipants: $('rationParticipants'), rationPayer: $('rationPayer'),
  rationDestination: $('rationDestination'), rationResult: $('rationResult'), buyRationsBtn: $('buyRationsBtn'),
  addCharacterBtn: $('addCharacterBtn'), addAnimalBtn: $('addAnimalBtn'), groupList: $('groupList'),
  historyList: $('historyList'), clearHistoryBtn: $('clearHistoryBtn'),
  itemDialog: $('itemDialog'), itemForm: $('itemForm'), itemDialogTitle: $('itemDialogTitle'), itemId: $('itemId'),
  itemName: $('itemName'), itemDescription: $('itemDescription'), itemCategory: $('itemCategory'), itemContainer: $('itemContainer'),
  itemQty: $('itemQty'), itemUnit: $('itemUnit'), itemLoad: $('itemLoad'), itemBackpack: $('itemBackpack'),
  itemIsContainer: $('itemIsContainer'), itemCharges: $('itemCharges'), itemMaxCharges: $('itemMaxCharges'), itemNotes: $('itemNotes'),
  transferDialog: $('transferDialog'), transferForm: $('transferForm'), transferItemId: $('transferItemId'),
  transferItemName: $('transferItemName'), transferSummary: $('transferSummary'), transferDestinations: $('transferDestinations'),
  transferQuantityField: $('transferQuantityField'), transferQuantity: $('transferQuantity'),
  transferQuantityHelp: $('transferQuantityHelp'), transferContentsWarning: $('transferContentsWarning'),
  holderDialog: $('holderDialog'), holderForm: $('holderForm'), holderDialogTitle: $('holderDialogTitle'), holderId: $('holderId'),
  holderName: $('holderName'), holderType: $('holderType'), holderSubtype: $('holderSubtype'), holderPlayer: $('holderPlayer'),
  holderMine: $('holderMine'), holderStrength: $('holderStrength'), holderConstitution: $('holderConstitution'), holderCapacity: $('holderCapacity'),
  holderActive: $('holderActive'), holderConsumesRations: $('holderConsumesRations'), holderDailyRations: $('holderDailyRations'),
  holderPlayerLabel: $('holderPlayerLabel'), holderMineLabel: $('holderMineLabel'), holderStrengthLabel: $('holderStrengthLabel'),
  holderConstitutionLabel: $('holderConstitutionLabel'), holderCapacityLabel: $('holderCapacityLabel'),
  removeHolderDialog: $('removeHolderDialog'), removeHolderForm: $('removeHolderForm'), removeHolderId: $('removeHolderId'),
  removeHolderMessage: $('removeHolderMessage'), removeTargetLabel: $('removeTargetLabel'), removeHolderTarget: $('removeHolderTarget'),
  settingsDialog: $('settingsDialog'), settingsForm: $('settingsForm'), settingsCampaignName: $('settingsCampaignName'),
  exportBtn: $('exportBtn'), importInput: $('importInput')
};

const state = {
  mode: 'local', cloud: null, cloudConfigured: false, cloudInitError: null, user: null, identity: null, campaignId: null,
  campaign: null, containers: [], items: [], history: [], unsubs: [], activeView: 'resumo', selectedItemIds: new Set(),
  channel: 'BroadcastChannel' in window ? new BroadcastChannel('old-helper-inventory-v3') : null
};

const INSTALL_DISMISSED_KEY = 'oldHelperInstallDismissed';
const LAST_CAMPAIGN_KEY = 'oldHelperCampaignId';
let deferredInstallPrompt = null;

function isInstalledMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function installWasDismissed() {
  try { return sessionStorage.getItem(INSTALL_DISMISSED_KEY) === 'true'; } catch { return false; }
}
function updateInstallBanner() {
  const shouldShow = !isInstalledMode() && !installWasDismissed();
  dom.installBanner.classList.toggle('hidden', !shouldShow);
  dom.installBtn.disabled = !shouldShow;
  dom.installDescription.textContent = deferredInstallPrompt
    ? 'Acesse suas campanhas como um aplicativo e mantenha a interface disponível offline.'
    : 'Instale pelo navegador para acessar suas campanhas como um aplicativo.';
}
function dismissInstallBanner() {
  try { sessionStorage.setItem(INSTALL_DISMISSED_KEY, 'true'); } catch {}
  deferredInstallPrompt = null;
  updateInstallBanner();
}
async function requestAppInstall() {
  if (!deferredInstallPrompt) {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast(isIOS
      ? 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.'
      : 'Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.');
    return;
  }
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  updateInstallBanner();
  try {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    dismissInstallBanner();
  } catch (error) {
    console.warn('Não foi possível abrir o prompt de instalação.', error);
    updateInstallBanner();
  }
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallBanner();
});
window.addEventListener('appinstalled', dismissInstallBanner);

const categoryIcons = {
  'Arma': 'ra-sword', 'Armadura': 'ra-shield', 'Equipamento': 'ra-ammo-bag', 'Munição': 'ra-arrow-flights', 'Ração': 'ra-apple',
  'Moeda': 'ra-gold-bar', 'Consumível': 'ra-potion', 'Item mágico': 'ra-crystal-wand', 'Tesouro': 'ra-gem', 'Outro': 'ra-rune-stone'
};

function nowISO() { return new Date().toISOString(); }
function uid(prefix = 'id') {
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}
function normalizeCode(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }
function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}
function campaignCodeFromURL() {
  const raw = new URL(location.href).searchParams.get('campaign');
  if (raw === null) return { present:false, code:'' };
  return { present:true, code:normalizeCode(raw), valid:Boolean(normalizeCode(raw)) };
}
function rememberCampaign(code) {
  localStorage.setItem(LAST_CAMPAIGN_KEY, normalizeCode(code));
  sessionStorage.removeItem(LAST_CAMPAIGN_KEY);
}
function rememberedCampaign() {
  const code = normalizeCode(localStorage.getItem(LAST_CAMPAIGN_KEY) || sessionStorage.getItem(LAST_CAMPAIGN_KEY));
  if (code) localStorage.setItem(LAST_CAMPAIGN_KEY, code);
  sessionStorage.removeItem(LAST_CAMPAIGN_KEY);
  return code;
}
function forgetCampaign() {
  localStorage.removeItem(LAST_CAMPAIGN_KEY);
  sessionStorage.removeItem(LAST_CAMPAIGN_KEY);
}
function ownedCharacterKey() { return `oldHelperOwnedCharacter:${state.campaignId || ''}`; }
function ownedCharacterId() { return state.campaignId ? localStorage.getItem(ownedCharacterKey()) || '' : ''; }
function setOwnedCharacter(holderId = '') {
  if (!state.campaignId) return;
  if (holderId) localStorage.setItem(ownedCharacterKey(), holderId);
  else localStorage.removeItem(ownedCharacterKey());
}
function compareHoldersForDisplay(a, b) {
  const mine = ownedCharacterId();
  return Number(b.id === mine) - Number(a.id === mine) || num(a.order) - num(b.order) || a.name.localeCompare(b.name, 'pt-BR');
}
function updateCampaignURL(code = state.campaignId) {
  const url = new URL(location.href);
  if (code) url.searchParams.set('campaign', normalizeCode(code));
  else url.searchParams.delete('campaign');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}
function campaignShareURL() {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('campaign', state.campaignId);
  url.hash = state.activeView && state.activeView !== 'resumo' ? state.activeView : '';
  return url.href;
}
function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}
function num(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function integer(value, fallback = 0) { return Math.max(0, Math.floor(num(value, fallback))); }
function plural(value, singular, pluralForm = `${singular}s`) { return `${value} ${value === 1 ? singular : pluralForm}`; }
function rpgIcon(iconClass) { return `<i class="ra ${iconClass}" aria-hidden="true"></i>`; }
function toast(message, kind = '') {
  dom.toast.textContent = message;
  dom.toast.className = `toast show ${kind}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { dom.toast.className = 'toast'; }, 2800);
}
function formatDate(value) {
  if (!value) return 'agora';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).format(date);
}
function formatNumber(value, maximumFractionDigits = 2) {
  return num(value).toLocaleString('pt-BR', { maximumFractionDigits });
}
function holderKind(holder) {
  if (holder.type === 'character') return holder.subtype || 'Personagem';
  if (holder.type === 'animal') return holder.subtype || 'Animal de carga';
  return holder.subtype || 'Depósito compartilhado';
}
function useLocalIdentity() {
  const name = dom.displayName.value.trim() || state.identity?.name || 'Jogador';
  state.identity = { name, role:dom.userRole.value || state.identity?.role || 'player' };
  dom.displayName.value = name;
  localStorage.setItem('oldHelperIdentity', JSON.stringify(state.identity));
  return state.identity;
}
function setSync(text, kind = '') {
  dom.syncStatus.textContent = text;
  dom.syncStatus.className = `sync-status ${kind}`;
}
function cloudError(error) {
  console.error(error);
  setSync('Falha de sincronização', 'error');
  toast(error?.message || 'Falha no Firebase.', 'error');
}

async function initCloud() {
  const configured = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);
  state.cloudConfigured = configured;
  if (!configured) {
    state.mode = 'local';
    state.cloudInitError = null;
    dom.connectionBadge.textContent = 'Modo local — pronto para demonstração';
    dom.connectionBadge.className = 'status-badge local';
    return;
  }
  try {
    const [appMod, authMod, fsMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js')
    ]);
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    let db;
    try {
      db = fsMod.initializeFirestore(app, { localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }) });
    } catch (cacheError) {
      console.warn('Cache persistente indisponível; usando cache padrão.', cacheError);
      db = fsMod.getFirestore(app);
    }
    await authMod.signInAnonymously(auth);
    state.mode = 'cloud';
    state.cloudInitError = null;
    state.user = auth.currentUser;
    state.cloud = { db, ...fsMod };
    dom.connectionBadge.textContent = 'Firebase ativo — sincronização em tempo real';
    dom.connectionBadge.className = 'status-badge';
  } catch (error) {
    console.error(error);
    state.mode = 'local';
    state.cloudInitError = error;
    dom.connectionBadge.textContent = 'Firebase indisponível — usando modo local';
    dom.connectionBadge.className = 'status-badge error';
  }
}

function makeHolder(data) {
  const type = data.type || 'character';
  return {
    id: data.id || uid('holder'),
    name: data.name || 'Novo portador',
    type,
    subtype: data.subtype || '',
    player: type === 'character' ? (data.player || '') : '',
    order: num(data.order, 1),
    strength: type === 'character' ? num(data.strength, 10) : null,
    constitution: type === 'character' ? num(data.constitution, 10) : null,
    capacity: type === 'character' ? null : Math.max(0, num(data.capacity, type === 'animal' ? 20 : 0)),
    active: data.active !== false,
    consumesRations: data.consumesRations !== false,
    dailyRations: Math.max(0, num(data.dailyRations, type === 'stash' ? 0 : 1))
  };
}
function normalizeHolder(raw, index = 0) {
  return makeHolder({ ...raw, id: raw.id, order: raw.order ?? index + 1 });
}
function normalizeItem(raw) {
  return {
    id: raw.id || uid('item'), name: raw.name || 'Item', description: raw.description || '', category: raw.category || 'Outro',
    containerId: raw.containerId || '', parentItemId: raw.parentItemId || '', isContainer: Boolean(raw.isContainer),
    qty: Math.max(0, num(raw.qty, 0)), unit: raw.unit || 'un.',
    loadPerUnit: Math.max(0, num(raw.loadPerUnit, 0)), isBackpack: Boolean(raw.isBackpack),
    charges: Math.max(0, num(raw.charges, 0)), maxCharges: Math.max(0, num(raw.maxCharges, 0)), notes: raw.notes || '',
    originalOwnerId: typeof raw.originalOwnerId === 'string' ? raw.originalOwnerId : '',
    updatedAt: raw.updatedAt || nowISO(), updatedBy: raw.updatedBy || ''
  };
}

function indexItems(items = state.items) { return new Map(items.map((item) => [item.id, item])); }
function itemChildren(itemId, items = state.items) { return items.filter((item) => item.parentItemId === itemId); }
function itemAncestors(itemId, items = state.items) {
  const byId = indexItems(items); const ancestors = []; const visited = new Set([itemId]);
  let current = byId.get(itemId);
  while (current?.parentItemId) {
    const parent = byId.get(current.parentItemId);
    if (!parent || visited.has(parent.id)) break;
    ancestors.push(parent); visited.add(parent.id); current = parent;
  }
  return ancestors;
}
function itemDescendants(itemId, items = state.items) {
  const childrenByParent = new Map();
  for (const item of items) {
    if (!item.parentItemId) continue;
    if (!childrenByParent.has(item.parentItemId)) childrenByParent.set(item.parentItemId, []);
    childrenByParent.get(item.parentItemId).push(item);
  }
  const descendants = []; const visited = new Set([itemId]); const queue = [...(childrenByParent.get(itemId) || [])];
  while (queue.length) {
    const child = queue.shift();
    if (visited.has(child.id)) continue;
    visited.add(child.id); descendants.push(child); queue.push(...(childrenByParent.get(child.id) || []));
  }
  return descendants;
}
function itemDepth(itemId, items = state.items) { return itemAncestors(itemId, items).length; }
function itemHolder(item, items = state.items) {
  const root = itemAncestors(item.id, items).at(-1) || item;
  return state.containers.find((holder) => holder.id === root.containerId) || state.containers.find((holder) => holder.id === item.containerId) || null;
}
function repairItemTree(items = state.items, containers = state.containers) {
  if (!containers.length) return items;
  const byId = indexItems(items); const holderIds = new Set(containers.map((holder) => holder.id)); const fallbackId = containers[0].id;
  for (const item of items) {
    if (!holderIds.has(item.containerId)) item.containerId = fallbackId;
    const parent = byId.get(item.parentItemId);
    if (item.parentItemId && (!parent || parent.id === item.id || !parent.isContainer)) item.parentItemId = '';
  }
  for (const item of items) {
    const visited = new Set([item.id]); let current = item;
    while (current.parentItemId) {
      if (visited.has(current.parentItemId)) { item.parentItemId = ''; break; }
      visited.add(current.parentItemId); current = byId.get(current.parentItemId);
      if (!current) { item.parentItemId = ''; break; }
    }
  }
  const resolveHolderId = (item, visited = new Set()) => {
    if (!item.parentItemId || visited.has(item.id)) return holderIds.has(item.containerId) ? item.containerId : fallbackId;
    visited.add(item.id);
    const parent = byId.get(item.parentItemId);
    return parent ? resolveHolderId(parent, visited) : fallbackId;
  };
  for (const item of items) item.containerId = resolveHolderId(item);
  return items;
}

function localKey(code) { return `oldHelperCampaign:${normalizeCode(code)}`; }
function readLocal(code) {
  try { return JSON.parse(localStorage.getItem(localKey(code))); } catch { return null; }
}
function writeLocal() {
  if (!state.campaignId) return;
  const payload = { campaign: state.campaign, containers: state.containers, items: state.items, history: state.history };
  localStorage.setItem(localKey(state.campaignId), JSON.stringify(payload));
  state.channel?.postMessage({ type:'update', code:state.campaignId });
  setSync('Salvo neste navegador', 'local');
}
function refreshLocal() {
  const data = readLocal(state.campaignId);
  if (!data) return;
  state.campaign = data.campaign;
  state.containers = (data.containers || []).map(normalizeHolder).sort((a,b) => a.order - b.order);
  state.items = repairItemTree((data.items || []).map(normalizeItem));
  state.history = data.history || [];
  setSync('Salvo neste navegador', 'local');
  renderAll();
}

async function createCampaign(name) {
  const maxAttempts = 12;
  let code = '';
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    code = makeCode();
    const campaign = { id:code, name, createdAt:nowISO(), updatedAt:nowISO() };
    if (state.mode === 'cloud') {
      const { db, doc, runTransaction, serverTimestamp } = state.cloud;
      const campaignRef = doc(db, 'campaigns', code);
      const created = await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(campaignRef);
        if (existing.exists()) return false;
        transaction.set(campaignRef, { ...campaign, createdBy:state.user.uid, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
        return true;
      });
      if (!created) continue;
    } else {
      if (readLocal(code)) continue;
      localStorage.setItem(localKey(code), JSON.stringify({ campaign, containers:[], items:[], history:[] }));
    }
    await enterCampaign(code);
    await addHistory(`${state.identity.name} criou a campanha.`);
    return;
  }
  throw new Error('Não foi possível gerar um código único. Tente novamente.');
}
async function campaignExists(code) {
  if (state.mode !== 'cloud' && state.cloudConfigured && state.cloudInitError) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await initCloud();
  }
  if (state.mode === 'cloud') {
    const { db, doc, getDoc } = state.cloud;
    return (await getDoc(doc(db, 'campaigns', code))).exists();
  }
  const existsLocally = Boolean(readLocal(code));
  if (!existsLocally && state.cloudConfigured && state.cloudInitError) {
    throw new Error('Não foi possível acessar o Firebase. Verifique sua conexão e tente novamente.');
  }
  return existsLocally;
}
async function enterCampaign(code) {
  const normalized = normalizeCode(code);
  if (!normalized) throw new Error('Informe um código alfanumérico válido.');
  if (!await campaignExists(normalized)) throw new Error('Campanha não encontrada. Confira o código.');
  clearListeners();
  state.campaignId = normalized;
  rememberCampaign(normalized);
  updateCampaignURL(normalized);
  dom.landing.classList.add('hidden');
  dom.app.classList.remove('hidden');
  if (state.mode === 'cloud') attachCloudListeners(); else refreshLocal();
  switchView((location.hash || '#resumo').slice(1), false);
}
function clearListeners() {
  state.unsubs.forEach((unsubscribe) => { try { unsubscribe(); } catch {} });
  state.unsubs = [];
}
function attachCloudListeners() {
  const { db, doc, collection, query, orderBy, limit, onSnapshot } = state.cloud;
  const code = state.campaignId;
  setSync('Conectando…');
  state.unsubs.push(onSnapshot(doc(db, 'campaigns', code), (snap) => {
    if (!snap.exists()) { toast('A campanha foi removida.', 'error'); leaveCampaign(); return; }
    state.campaign = { id:snap.id, ...snap.data() };
    renderAll();
  }, cloudError));
  state.unsubs.push(onSnapshot(query(collection(db, 'campaigns', code, 'containers'), orderBy('order')), (snap) => {
    state.containers = snap.docs.map((d, index) => normalizeHolder({ id:d.id, ...d.data() }, index));
    repairItemTree(); renderAll();
  }, cloudError));
  state.unsubs.push(onSnapshot(collection(db, 'campaigns', code, 'items'), (snap) => {
    state.items = repairItemTree(snap.docs.map((d) => normalizeItem({ id:d.id, ...d.data() })));
    renderAll();
  }, cloudError));
  state.unsubs.push(onSnapshot(query(collection(db, 'campaigns', code, 'history'), orderBy('at', 'desc'), limit(100)), (snap) => {
    state.history = snap.docs.map((d) => ({ id:d.id, ...d.data() }));
    renderHistory();
    setSync('Sincronizado em tempo real');
  }, cloudError));
}
function leaveCampaign() {
  clearListeners();
  state.campaignId = null; state.campaign = null; state.containers = []; state.items = []; state.history = []; state.selectedItemIds.clear();
  forgetCampaign();
  updateCampaignURL('');
  dom.app.classList.add('hidden'); dom.landing.classList.remove('hidden');
}

async function addHistory(text) {
  const entry = { text, by:state.identity?.name || 'Usuário', at:nowISO() };
  if (state.mode === 'cloud') {
    const { db, collection, addDoc, serverTimestamp } = state.cloud;
    await addDoc(collection(db, 'campaigns', state.campaignId, 'history'), { ...entry, at:serverTimestamp() });
  } else {
    state.history.unshift({ id:uid('history'), ...entry });
    state.history = state.history.slice(0, 100);
    writeLocal();
    renderHistory();
  }
}

function validateBackpack(item, containerId = item.containerId, parentItemId = item.parentItemId) {
  if (!item.isBackpack) return;
  const holder = state.containers.find((candidate) => candidate.id === containerId);
  if (holder?.type !== 'character') throw new Error('A mochila equipada deve ficar diretamente com um personagem.');
  if (parentItemId) throw new Error('A mochila equipada não pode ficar dentro de outro item.');
  if (![0, 1].includes(num(item.qty))) throw new Error('Cada personagem pode carregar no máximo uma mochila equipada.');
  const conflict = state.items.some((candidate) => candidate.id !== item.id && candidate.containerId === containerId && candidate.isBackpack && num(candidate.qty) > 0);
  if (num(item.qty) > 0 && conflict) throw new Error(`${holder.name} já possui uma mochila equipada.`);
}

async function saveItem(item) {
  const existing = state.items.find((candidate) => candidate.id === item.id);
  const descendants = existing ? itemDescendants(existing.id) : [];
  if (existing?.isContainer && !item.isContainer && descendants.length) throw new Error('Transfira ou remova o conteúdo antes de desativar este contêiner.');
  validateBackpack(item);
  item.updatedAt = nowISO(); item.updatedBy = state.identity.name;
  const holderChanged = Boolean(existing && existing.containerId !== item.containerId);
  if (state.mode === 'cloud') {
    const { db, doc, setDoc, writeBatch, serverTimestamp } = state.cloud;
    const ref = doc(db, 'campaigns', state.campaignId, 'items', item.id);
    const payload = { ...item, updatedAt:serverTimestamp() }; delete payload.id;
    if (holderChanged && descendants.length) {
      const batch = writeBatch(db);
      batch.set(ref, payload, { merge:true });
      for (const child of descendants) batch.update(doc(db, 'campaigns', state.campaignId, 'items', child.id), { containerId:item.containerId, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
      await batch.commit();
    } else await setDoc(ref, payload, { merge:true });
  } else {
    if (existing) Object.assign(existing, item); else state.items.push({ ...item });
    if (holderChanged) for (const child of descendants) Object.assign(child, { containerId:item.containerId, updatedAt:nowISO(), updatedBy:state.identity.name });
    writeLocal(); renderAll();
  }
  await addHistory(existing ? `${state.identity.name} atualizou “${item.name}”.` : `${state.identity.name} adicionou “${item.name}”.`);
}
async function patchItem(id, patch, historyText) {
  const item = state.items.find((candidate) => candidate.id === id); if (!item) return;
  validateBackpack({ ...item, ...patch });
  if (state.mode === 'cloud') {
    const { db, doc, updateDoc, serverTimestamp } = state.cloud;
    await updateDoc(doc(db, 'campaigns', state.campaignId, 'items', id), { ...patch, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
  } else {
    Object.assign(item, patch, { updatedAt:nowISO(), updatedBy:state.identity.name });
    writeLocal(); renderAll();
  }
  if (historyText) await addHistory(historyText);
}
async function deleteItem(id) {
  const item = state.items.find((candidate) => candidate.id === id); if (!item) return;
  if (itemDescendants(id).length) return toast('Transfira ou remova o conteúdo antes de excluir este contêiner.', 'error');
  if (!confirm(`Remover “${item.name}” do inventário?`)) return;
  if (state.mode === 'cloud') {
    const { db, doc, deleteDoc } = state.cloud;
    await deleteDoc(doc(db, 'campaigns', state.campaignId, 'items', id));
  } else {
    state.items = state.items.filter((candidate) => candidate.id !== id);
    writeLocal(); renderAll();
  }
  await addHistory(`${state.identity.name} removeu “${item.name}”.`);
}

async function saveHolder(holder) {
  const existing = state.containers.find((candidate) => candidate.id === holder.id);
  const normalized = normalizeHolder(holder, state.containers.length);
  if (state.mode === 'cloud') {
    const { db, doc, collection, setDoc } = state.cloud;
    const ref = normalized.id ? doc(db, 'campaigns', state.campaignId, 'containers', normalized.id) : doc(collection(db, 'campaigns', state.campaignId, 'containers'));
    normalized.id = ref.id;
    const payload = { ...normalized }; delete payload.id;
    await setDoc(ref, payload, { merge:true });
  } else {
    if (existing) Object.assign(existing, normalized); else state.containers.push(normalized);
    state.containers.sort((a,b) => a.order - b.order);
    writeLocal(); renderAll();
  }
  await addHistory(existing ? `${state.identity.name} atualizou ${normalized.name}.` : `${state.identity.name} adicionou ${normalized.name} ao grupo.`);
}
async function removeHolder(holderId, targetId = '') {
  const holder = state.containers.find((candidate) => candidate.id === holderId);
  if (!holder) return;
  const affected = state.items.filter((item) => item.containerId === holderId);
  if (affected.length && !targetId) throw new Error('Escolha um destino para os itens.');
  const target = state.containers.find((candidate) => candidate.id === targetId);
  if (state.mode === 'cloud') {
    const { db, doc, collection, writeBatch, serverTimestamp } = state.cloud;
    const batch = writeBatch(db);
    for (const item of affected) {
      batch.update(doc(db, 'campaigns', state.campaignId, 'items', item.id), { containerId:targetId, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
    }
    batch.delete(doc(db, 'campaigns', state.campaignId, 'containers', holderId));
    const historyRef = doc(collection(db, 'campaigns', state.campaignId, 'history'));
    const transferText = affected.length ? ` e transferiu ${plural(affected.length, 'tipo de item')} para ${target?.name || 'outro portador'}` : '';
    batch.set(historyRef, { text:`${state.identity.name} removeu ${holder.name}${transferText}.`, by:state.identity.name, at:serverTimestamp() });
    await batch.commit();
  } else {
    for (const item of affected) item.containerId = targetId;
    state.containers = state.containers.filter((candidate) => candidate.id !== holderId);
    state.history.unshift({ id:uid('history'), text:`${state.identity.name} removeu ${holder.name}${affected.length ? ` e transferiu seus itens para ${target?.name}` : ''}.`, by:state.identity.name, at:nowISO() });
    writeLocal(); renderAll();
  }
  if (holderId === ownedCharacterId()) setOwnedCharacter('');
}

function containerCapacity(container) {
  if (!container) return 0;
  if (container.type !== 'character') return Math.max(0, num(container.capacity));
  const base = Math.max(num(container.strength, 10), num(container.constitution, 10));
  const hasBackpack = state.items.some((item) => item.containerId === container.id && !item.parentItemId && item.isBackpack && num(item.qty) > 0);
  return base + (hasBackpack ? 5 : 0);
}
function itemHasNoLoad(item) {
  return item.category !== 'Moeda' && num(item.loadPerUnit) === 0;
}
function compareInventoryItems(a, b) {
  const rank = (item) => itemHasNoLoad(item) ? (item.isContainer ? 1 : 2) : 0;
  return rank(a) - rank(b) || a.name.localeCompare(b.name, 'pt-BR');
}
function originalOwnerAfterTransfer(item, targetContainerId) {
  const originHolder = state.containers.find((holder) => holder.id === item.containerId);
  const targetHolder = state.containers.find((holder) => holder.id === targetContainerId);
  if (targetHolder?.type !== 'animal') return '';
  if (originHolder?.type === 'animal') return item.originalOwnerId || '';
  return originHolder?.id || '';
}
function containerLoad(containerId) {
  const items = state.items.filter((item) => item.containerId === containerId);
  const coins = items.filter((item) => item.category === 'Moeda').reduce((sum, item) => sum + num(item.qty), 0);
  const other = items.filter((item) => item.category !== 'Moeda').reduce((sum, item) => sum + num(item.qty) * num(item.loadPerUnit), 0);
  return Math.floor(coins / 100 + other);
}
function holderWallet(containerId) {
  const wallet = { PO:0, PP:0, PC:0 };
  state.items.filter((item) => item.containerId === containerId && item.category === 'Moeda').forEach((item) => {
    if (Object.hasOwn(wallet, item.unit)) wallet[item.unit] += num(item.qty);
  });
  return wallet;
}
function groupTotals() {
  const currency = { PO:0, PP:0, PC:0 };
  let ammo = 0, rations = 0, charges = 0, magicItems = 0;
  for (const item of state.items) {
    if (item.category === 'Moeda' && Object.hasOwn(currency, item.unit)) currency[item.unit] += num(item.qty);
    if (item.category === 'Munição') ammo += num(item.qty);
    if (item.category === 'Ração') rations += num(item.qty);
    if (num(item.maxCharges) > 0) charges += num(item.charges);
    if (item.category === 'Item mágico') magicItems += num(item.qty);
  }
  return { currency, ammo, rations, charges, magicItems };
}

function destinationValue(item) { return item?.parentItemId ? `item:${item.parentItemId}` : `holder:${item?.containerId || ''}`; }
function destinationChoices(excludeItemId = '') {
  const excluded = new Set(excludeItemId ? [excludeItemId, ...itemDescendants(excludeItemId).map((item) => item.id)] : []);
  const childrenByParent = new Map();
  for (const item of state.items) {
    if (!childrenByParent.has(item.parentItemId)) childrenByParent.set(item.parentItemId, []);
    childrenByParent.get(item.parentItemId).push(item);
  }
  for (const children of childrenByParent.values()) children.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const choices = [];
  const visit = (item, depth) => {
    if (item.isContainer && !excluded.has(item.id)) choices.push({ value:`item:${item.id}`, label:`${'  '.repeat(depth)}↳ ${item.name}`, containerId:item.containerId, parentItemId:item.id });
    for (const child of childrenByParent.get(item.id) || []) visit(child, depth + 1);
  };
  for (const holder of [...state.containers].sort(compareHoldersForDisplay)) {
    choices.push({ value:`holder:${holder.id}`, label:holder.name, containerId:holder.id, parentItemId:'' });
    for (const root of (childrenByParent.get('') || []).filter((item) => item.containerId === holder.id)) visit(root, 1);
  }
  return choices;
}
function resolveDestination(value, excludeItemId = '') {
  const target = destinationChoices(excludeItemId).find((choice) => choice.value === value);
  if (!target) throw new Error('Escolha um portador ou item contêiner válido.');
  return target;
}
function populateItemDestinationSelect(excludeItemId = '', preferredValue = '') {
  const choices = destinationChoices(excludeItemId);
  dom.itemContainer.innerHTML = choices.map((choice) => `<option value="${esc(choice.value)}">${esc(choice.label)}</option>`).join('');
  if (choices.some((choice) => choice.value === preferredValue)) dom.itemContainer.value = preferredValue;
}

function renderAll() {
  if (!state.campaign) return;
  dom.campaignTitle.textContent = state.campaign.name || 'Carga do Grupo';
  dom.campaignCode.textContent = state.campaignId;
  populateContainerSelects();
  renderSummary(); renderDashboard(); renderInventory(); renderRationParticipants(); renderRationCalculator(); renderGroup(); renderHistory();
}
function populateContainerSelects() {
  const currentFilter = dom.containerFilter.value;
  const currentItem = dom.itemContainer.value;
  const currentPayer = dom.rationPayer.value;
  const currentDestination = dom.rationDestination.value;
  const options = [...state.containers].sort(compareHoldersForDisplay).map((holder) => `<option value="${esc(holder.id)}">${esc(holder.name)}</option>`).join('');
  dom.containerFilter.innerHTML = `<option value="">Todos</option>${options}`;
  populateItemDestinationSelect(dom.itemId.value, currentItem);
  dom.rationPayer.innerHTML = options;
  dom.rationDestination.innerHTML = options;
  if ([...dom.containerFilter.options].some((option) => option.value === currentFilter)) dom.containerFilter.value = currentFilter;
  if ([...dom.rationPayer.options].some((option) => option.value === currentPayer)) dom.rationPayer.value = currentPayer;
  else dom.rationPayer.value = state.containers.find((holder) => holder.type === 'animal')?.id || state.containers[0]?.id || '';
  if ([...dom.rationDestination.options].some((option) => option.value === currentDestination)) dom.rationDestination.value = currentDestination;
  else dom.rationDestination.value = state.containers.find((holder) => holder.type === 'animal')?.id || state.containers[0]?.id || '';
}
function renderSummary() {
  const { currency, ammo, rations, charges, magicItems } = groupTotals();
  const overloaded = state.containers.filter((holder) => containerLoad(holder.id) > containerCapacity(holder));
  const activeConsumers = state.containers.filter((holder) => holder.active && holder.consumesRations && num(holder.dailyRations) > 0);
  const daily = activeConsumers.reduce((sum, holder) => sum + num(holder.dailyRations), 0);
  const autonomy = daily > 0 ? Math.floor(rations / daily) : 0;
  const cards = [
    ['Ouro do grupo', formatNumber(currency.PO, 0), `${formatNumber(currency.PP,0)} PP · ${formatNumber(currency.PC,0)} PC`],
    ['Projéteis', formatNumber(ammo, 0), 'flechas, virotes e munições'],
    ['Rações', formatNumber(rations, 0), daily > 0 ? `aprox. ${autonomy} dia(s) para o grupo ativo` : 'nenhum consumo configurado'],
    ['Cargas mágicas', formatNumber(charges, 0), `${formatNumber(magicItems,0)} item(ns) mágico(s)`],
    ['Portadores', formatNumber(state.containers.length, 0), `${state.containers.filter((h) => h.type === 'character').length} personagens · ${state.containers.filter((h) => h.type === 'animal').length} animais`],
    ['Sobrecarga', formatNumber(overloaded.length, 0), overloaded.length ? overloaded.map((holder) => holder.name).join(', ') : 'nenhum portador sobrecarregado']
  ];
  dom.summary.innerHTML = cards.map(([label,value,detail]) => `<article class="card summary-card"><span class="summary-label">${esc(label)}</span><strong class="summary-value">${esc(value)}</strong><span class="summary-detail">${esc(detail)}</span></article>`).join('');
}
function renderDashboard() {
  dom.walletSummary.innerHTML = state.containers.length ? [...state.containers].sort(compareHoldersForDisplay).map((holder) => {
    const wallet = holderWallet(holder.id);
    return `<div class="wallet-row"><div><div class="wallet-name">${esc(holder.name)}</div><div class="wallet-kind">${esc(holderKind(holder))}</div></div><div class="coin-stack"><span class="coin-pill">${formatNumber(wallet.PO,0)} PO</span><span class="coin-pill">${formatNumber(wallet.PP,0)} PP</span><span class="coin-pill">${formatNumber(wallet.PC,0)} PC</span></div></div>`;
  }).join('') : '<div class="empty-state"><div aria-hidden="true"><i class="ra ra-player"></i></div><h3>Configure o grupo</h3><p>Adicione um personagem ou animal de carga na tela Grupo para começar.</p></div>';

  const alerts = [];
  for (const holder of state.containers) {
    const load = containerLoad(holder.id); const capacity = containerCapacity(holder);
    if (capacity > 0 && load > capacity) alerts.push({ kind:'danger', text:`${holder.name} está sobrecarregado: ${formatNumber(load)} / ${formatNumber(capacity)}.` });
  }
  for (const item of state.items) {
    if (num(item.maxCharges) > 0 && num(item.charges) <= Math.max(1, Math.floor(num(item.maxCharges) * .2))) alerts.push({ kind:'', text:`${item.name} está com poucas cargas (${formatNumber(item.charges,0)}/${formatNumber(item.maxCharges,0)}).` });
  }
  const totals = groupTotals();
  const daily = state.containers.filter((h) => h.active && h.consumesRations).reduce((sum, h) => sum + num(h.dailyRations), 0);
  if (daily > 0 && totals.rations < daily * 3) alerts.push({ kind:'danger', text:`O estoque de rações dura menos de 3 dias para o grupo ativo.` });
  if (!state.containers.length) alerts.push({ kind:'', text:'O grupo está vazio. Adicione o primeiro personagem ou animal de carga.' });
  else if (!alerts.length) alerts.push({ kind:'ok', text:'Nenhum alerta importante no momento.' });
  dom.alertsSummary.innerHTML = alerts.slice(0, 10).map((alert) => `<div class="alert-item ${alert.kind}">${rpgIcon(alert.kind === 'danger' ? 'ra-skull' : alert.kind === 'ok' ? 'ra-health' : 'ra-ringing-bell')}<span>${esc(alert.text)}</span></div>`).join('');
}

function filteredItems() {
  const query = dom.searchInput.value.trim().toLowerCase();
  const category = dom.categoryFilter.value;
  const containerId = dom.containerFilter.value;
  const matched = state.items.filter((item) => {
    const holder = state.containers.find((candidate) => candidate.id === item.containerId);
    const haystack = `${item.name} ${item.description || ''} ${item.notes || ''} ${holder?.name || ''}`.toLowerCase();
    return (!query || haystack.includes(query)) && (!category || item.category === category) && (!containerId || item.containerId === containerId);
  });
  if (!query && !category) return matched;
  const visibleIds = new Set(matched.map((item) => item.id));
  for (const item of matched) for (const ancestor of itemAncestors(item.id)) visibleIds.add(ancestor.id);
  return state.items.filter((item) => visibleIds.has(item.id) && (!containerId || item.containerId === containerId));
}
function updateBulkTransferButton() {
  const count = state.selectedItemIds.size;
  dom.bulkTransferBtn.disabled = count === 0;
  dom.bulkTransferBtn.innerHTML = `${rpgIcon('ra-cycle')} ${count
    ? `Transferir ${plural(count, 'selecionado', 'selecionados')} para animal`
    : 'Transferir selecionados para animal'}`;
}
function renderInventory() {
  const existingIds = new Set(state.items.map((item) => item.id));
  for (const id of state.selectedItemIds) if (!existingIds.has(id)) state.selectedItemIds.delete(id);
  updateBulkTransferButton();
  const visible = filteredItems();
  const selected = dom.containerFilter.value;
  const holders = state.containers.filter((holder) => !selected || holder.id === selected).sort(compareHoldersForDisplay);
  if (!holders.length) {
    dom.inventory.innerHTML = '';
    dom.inventory.append($('emptyTemplate').content.cloneNode(true));
    return;
  }
  dom.inventory.innerHTML = holders.map((holder) => renderContainer(holder, visible.filter((item) => item.containerId === holder.id))).join('');
  bindInventoryActions();
}
function renderContainer(holder, items) {
  const totalItems = state.items.filter((item) => item.containerId === holder.id);
  const load = containerLoad(holder.id); const capacity = containerCapacity(holder);
  const percent = capacity > 0 ? Math.min(100, load / capacity * 100) : 0;
  const loadClass = load > capacity ? 'over' : load >= capacity * .8 ? 'warning' : '';
  const subtitleParts = [holderKind(holder)];
  if (holder.type === 'character') subtitleParts.push(`FOR ${num(holder.strength,10)} · CON ${num(holder.constitution,10)}`);
  if (totalItems.some((item) => item.isBackpack && num(item.qty) > 0)) subtitleParts.push('mochila +5');
  const visibleIds = new Set(items.map((item) => item.id));
  const roots = items.filter((item) => !item.parentItemId || !visibleIds.has(item.parentItemId)).sort(compareInventoryItems);
  const rows = roots.length
    ? `<ul class="item-list">${roots.map((item) => renderItemNode(item, visibleIds)).join('')}</ul>`
    : '<div class="empty-container">Nenhum item neste portador com os filtros atuais.</div>';
  return `<article class="card container-card"><header class="container-header"><div class="container-title-row"><div><h2>${esc(holder.name)}</h2><div class="container-subtitle">${esc(subtitleParts.join(' · '))} · ${plural(totalItems.length, 'tipo de item')}</div></div><div class="load-number">${formatNumber(load)} / ${formatNumber(capacity)}</div></div><div class="load-track" title="Carga"><div class="load-fill ${loadClass}" style="width:${percent}%"></div></div></header>${rows}</article>`;
}
function renderItemNode(item, visibleIds) {
  const children = itemChildren(item.id).filter((child) => visibleIds.has(child.id)).sort(compareInventoryItems);
  return `<li class="item-node">${renderItem(item)}${children.length ? `<ul class="item-children">${children.map((child) => renderItemNode(child, visibleIds)).join('')}</ul>` : ''}</li>`;
}
function renderItem(item) {
  const icon = rpgIcon(categoryIcons[item.category] || 'ra-rune-stone');
  const charges = num(item.maxCharges) > 0 ? `<span class="tag">${rpgIcon('ra-crystal-wand')} ${formatNumber(item.charges,0)}/${formatNumber(item.maxCharges,0)} cargas</span>` : '';
  const hasNoLoad = itemHasNoLoad(item);
  const load = item.category === 'Moeda' ? '1 carga/100 moedas' : `${formatNumber(item.loadPerUnit)} carga/un.`;
  const loadMeta = hasNoLoad ? '<span class="tag no-load-tag">sem carga</span>' : `<span>${esc(load)}</span>`;
  const currentHolder = state.containers.find((holder) => holder.id === item.containerId);
  const originalOwner = currentHolder?.type === 'animal' ? state.containers.find((holder) => holder.id === item.originalOwnerId) : null;
  const ownerTag = originalOwner ? `<span class="tag owner-tag">Dono: ${esc(originalOwner.name)}</span>` : '';
  const selected = state.selectedItemIds.has(item.id);
  return `<div class="item-row ${hasNoLoad ? 'no-load ' : ''}${selected ? 'selected' : ''}" data-id="${esc(item.id)}"><div><label class="item-select"><input type="checkbox" data-select-item value="${esc(item.id)}" ${selected ? 'checked' : ''}><span class="item-name">${icon} ${esc(item.name)}</span></label>${item.description ? `<p class="item-description">${esc(item.description)}</p>` : ''}<div class="item-meta"><span class="tag">${esc(item.category)}</span>${ownerTag}<span>${formatNumber(item.qty)} ${esc(item.unit || 'un.')}</span>${charges}${loadMeta}${item.isBackpack ? '<span class="tag">mochila equipada</span>' : ''}${item.isContainer ? `<span class="tag container-tag">${rpgIcon('ra-locked-fortress')} contêiner</span>` : ''}</div>${item.notes ? `<p class="item-notes"><strong>Observações:</strong> ${esc(item.notes)}</p>` : ''}</div><div class="item-actions"><div class="counter" aria-label="Quantidade"><button data-action="qty-minus" title="Diminuir" aria-label="Diminuir quantidade"><span class="counter-symbol" aria-hidden="true">−</span></button><span>${formatNumber(item.qty)}</span><button data-action="qty-plus" title="Aumentar" aria-label="Aumentar quantidade" ${item.isBackpack && num(item.qty) >= 1 ? 'disabled' : ''}><span class="counter-symbol" aria-hidden="true">+</span></button></div>${num(item.maxCharges) > 0 ? `<div class="counter" aria-label="Cargas"><button data-action="charge-minus" title="Usar carga" aria-label="Usar carga">${rpgIcon('ra-health-decrease')}</button><span>${rpgIcon('ra-crystal-wand')} ${formatNumber(item.charges,0)}</span><button data-action="charge-plus" title="Repor carga" aria-label="Repor carga">${rpgIcon('ra-health-increase')}</button></div>` : ''}<div class="mini-actions"><button class="mini-button" data-action="transfer" title="Transferir" aria-label="Transferir item">${rpgIcon('ra-cycle')}</button><button class="mini-button" data-action="edit" title="Editar" aria-label="Editar item">${rpgIcon('ra-quill-ink')}</button><button class="mini-button" data-action="delete" title="Excluir" aria-label="Excluir item">${rpgIcon('ra-x-mark')}</button></div></div></div>`;
}
function bindInventoryActions() {
  dom.inventory.querySelectorAll('[data-select-item]').forEach((checkbox) => checkbox.addEventListener('change', (event) => {
    const id = event.currentTarget.value;
    if (event.currentTarget.checked) state.selectedItemIds.add(id); else state.selectedItemIds.delete(id);
    event.currentTarget.closest('.item-row')?.classList.toggle('selected', event.currentTarget.checked);
    updateBulkTransferButton();
  }));
  dom.inventory.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async (event) => {
    const row = event.currentTarget.closest('.item-row'); const item = state.items.find((candidate) => candidate.id === row?.dataset.id); if (!item) return;
    const action = event.currentTarget.dataset.action;
    try {
      if (action === 'qty-minus') await patchItem(item.id, { qty:Math.max(0, num(item.qty) - 1) }, `${state.identity.name} reduziu “${item.name}” para ${Math.max(0, num(item.qty) - 1)}.`);
      if (action === 'qty-plus') await patchItem(item.id, { qty:num(item.qty) + 1 }, `${state.identity.name} aumentou “${item.name}” para ${num(item.qty) + 1}.`);
      if (action === 'charge-minus') await patchItem(item.id, { charges:Math.max(0, num(item.charges) - 1) }, `${state.identity.name} usou uma carga de “${item.name}”.`);
      if (action === 'charge-plus') await patchItem(item.id, { charges:Math.min(num(item.maxCharges), num(item.charges) + 1) }, `${state.identity.name} ajustou as cargas de “${item.name}”.`);
      if (action === 'edit') openItemDialog(item);
      if (action === 'delete') await deleteItem(item.id);
      if (action === 'transfer') openTransferDialog(item);
    } catch (error) { cloudError(error); }
  }));
}
function transferDestinationDetails(choice) {
  const holder = state.containers.find((candidate) => candidate.id === choice.containerId);
  if (choice.parentItemId) {
    const containerItem = state.items.find((candidate) => candidate.id === choice.parentItemId);
    return { name:containerItem?.name || choice.label.trim(), kind:`Item contêiner · ${holder?.name || 'portador desconhecido'}` };
  }
  return { name:holder?.name || choice.label.trim(), kind:holder ? holderKind(holder) : 'Portador' };
}
function openTransferDialog(item) {
  const currentValue = destinationValue(item);
  const choices = destinationChoices(item.id).filter((choice) => choice.value !== currentValue);
  if (!choices.length) return toast('Não há outro destino válido para este item.', 'error');

  const currentHolder = state.containers.find((holder) => holder.id === item.containerId);
  const ownerDestination = currentHolder?.type === 'animal' && item.originalOwnerId ? `holder:${item.originalOwnerId}` : '';
  const preferred = choices.find((choice) => ownerDestination && choice.value === ownerDestination && !choice.parentItemId)
    || choices.find((choice) => !choice.parentItemId && state.containers.some((holder) => holder.id === choice.containerId && holder.type === 'animal'))
    || choices[0];
  dom.transferItemId.value = item.id;
  dom.transferItemName.textContent = `Transferir “${item.name}”`;
  const originItem = state.items.find((candidate) => candidate.id === item.parentItemId);
  const originHolder = state.containers.find((holder) => holder.id === item.containerId);
  dom.transferSummary.textContent = `Origem: ${originItem?.name || originHolder?.name || 'outro destino'} · Disponível: ${formatNumber(item.qty, 0)} ${item.unit || 'un.'}`;
  dom.transferDestinations.innerHTML = choices.map((choice) => {
    const details = transferDestinationDetails(choice);
    return `<label class="transfer-destination-option"><input type="radio" name="transferDestination" value="${esc(choice.value)}" ${choice.value === preferred.value ? 'checked' : ''}><span><strong>${esc(details.name)}</strong><small>${esc(details.kind)}</small></span></label>`;
  }).join('');

  const descendants = itemDescendants(item.id);
  const available = integer(item.qty);
  const canSplit = available > 1 && descendants.length === 0;
  dom.transferQuantityField.classList.toggle('hidden', !canSplit);
  dom.transferQuantity.min = '1';
  dom.transferQuantity.max = String(available);
  dom.transferQuantity.value = String(available);
  dom.transferQuantity.disabled = !canSplit;
  dom.transferQuantityHelp.textContent = canSplit ? `Escolha entre 1 e ${formatNumber(available, 0)} ${item.unit || 'un.'}.` : '';
  dom.transferContentsWarning.classList.toggle('hidden', descendants.length === 0);
  dom.transferContentsWarning.textContent = descendants.length
    ? `${plural(descendants.length, 'item contido será transferido', 'itens contidos serão transferidos')} junto. Este item não pode ser dividido.`
    : '';
  dom.transferDialog.showModal();
}

async function executeItemTransfer() {
  const item = state.items.find((candidate) => candidate.id === dom.transferItemId.value);
  if (!item) throw new Error('O item não está mais disponível.');
  const selectedValue = dom.transferForm.querySelector('input[name="transferDestination"]:checked')?.value;
  if (!selectedValue || selectedValue === destinationValue(item)) throw new Error('Escolha um destino válido.');
  const target = resolveDestination(selectedValue, item.id);
  validateBackpack(item, target.containerId, target.parentItemId);

  const descendants = itemDescendants(item.id);
  const available = integer(item.qty);
  const canSplit = available > 1 && descendants.length === 0;
  const quantity = canSplit ? Number(dom.transferQuantity.value) : available;
  if (canSplit && (!Number.isInteger(quantity) || quantity < 1 || quantity > available)) {
    throw new Error(`Informe uma quantidade inteira entre 1 e ${available}.`);
  }
  const partial = canSplit && quantity < available;
  const originItem = state.items.find((candidate) => candidate.id === item.parentItemId);
  const originHolder = state.containers.find((holder) => holder.id === item.containerId);
  const originLabel = originItem?.name || originHolder?.name || 'outro destino';
  const targetDetails = transferDestinationDetails(target);
  const transferredOwnerId = originalOwnerAfterTransfer(item, target.containerId);

  if (state.mode === 'cloud') {
    const { db, doc, collection, writeBatch, serverTimestamp } = state.cloud;
    const batch = writeBatch(db);
    const itemRef = doc(db, 'campaigns', state.campaignId, 'items', item.id);
    if (partial) {
      const newRef = doc(collection(db, 'campaigns', state.campaignId, 'items'));
      const newItem = {
        ...item, qty:quantity, containerId:target.containerId, parentItemId:target.parentItemId,
        originalOwnerId:transferredOwnerId, updatedAt:serverTimestamp(), updatedBy:state.identity.name
      };
      delete newItem.id;
      batch.update(itemRef, { qty:available - quantity, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
      batch.set(newRef, newItem);
    } else {
      batch.update(itemRef, { containerId:target.containerId, parentItemId:target.parentItemId, originalOwnerId:transferredOwnerId, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
      for (const child of descendants) batch.update(doc(db, 'campaigns', state.campaignId, 'items', child.id), { containerId:target.containerId, originalOwnerId:originalOwnerAfterTransfer(child, target.containerId), updatedAt:serverTimestamp(), updatedBy:state.identity.name });
    }
    await batch.commit();
  } else if (partial) {
    const timestamp = nowISO();
    Object.assign(item, { qty:available - quantity, updatedAt:timestamp, updatedBy:state.identity.name });
    state.items.push({
      ...item, id:uid('item'), qty:quantity, containerId:target.containerId, parentItemId:target.parentItemId,
      originalOwnerId:transferredOwnerId, updatedAt:timestamp, updatedBy:state.identity.name
    });
    writeLocal(); renderAll();
  } else {
    Object.assign(item, { containerId:target.containerId, parentItemId:target.parentItemId, originalOwnerId:transferredOwnerId, updatedAt:nowISO(), updatedBy:state.identity.name });
    for (const child of descendants) Object.assign(child, { containerId:target.containerId, originalOwnerId:originalOwnerAfterTransfer(child, target.containerId), updatedAt:nowISO(), updatedBy:state.identity.name });
    writeLocal(); renderAll();
  }

  const quantityText = `${formatNumber(quantity, 0)} ${item.unit || 'un.'}`;
  const contentsText = descendants.length ? ` com ${plural(descendants.length, 'item contido', 'itens contidos')}` : '';
  await addHistory(`${state.identity.name} transferiu ${quantityText} de “${item.name}”${contentsText} de ${originLabel} para ${targetDetails.name}.`);
  toast(`${quantityText} de “${item.name}” transferido para ${targetDetails.name}.`);
}
async function bulkTransferToAnimal() {
  const selectedItems = state.items.filter((item) => state.selectedItemIds.has(item.id));
  if (!selectedItems.length) throw new Error('Selecione pelo menos um item.');
  const animals = state.containers.filter((holder) => holder.type === 'animal');
  if (!animals.length) throw new Error('Adicione um animal de carga antes de transferir itens.');
  let target = animals[0];
  if (animals.length > 1) {
    const answer = prompt(`Transferir os itens selecionados para qual animal?\n${animals.map((animal, index) => `${index + 1}. ${animal.name}`).join('\n')}\n\nDigite o número:`);
    target = animals[Number(answer) - 1];
    if (!target) return;
  }
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const roots = selectedItems.filter((item) => !itemAncestors(item.id).some((ancestor) => selectedIds.has(ancestor.id)));
  for (const item of roots) validateBackpack(item, target.id, '');
  const changes = new Map();
  for (const root of roots) {
    if (root.containerId === target.id && !root.parentItemId) continue;
    changes.set(root.id, { item:root, root:true });
    for (const child of itemDescendants(root.id)) changes.set(child.id, { item:child, root:false });
  }
  if (!changes.size) throw new Error(`Os itens selecionados já estão diretamente com ${target.name}.`);
  if (changes.size > 450) throw new Error('Selecione menos itens por transferência.');
  if (state.mode === 'cloud') {
    const { db, doc, writeBatch, serverTimestamp } = state.cloud;
    const batch = writeBatch(db);
    for (const { item, root } of changes.values()) {
      const patch = { containerId:target.id, originalOwnerId:originalOwnerAfterTransfer(item, target.id), updatedAt:serverTimestamp(), updatedBy:state.identity.name };
      if (root) patch.parentItemId = '';
      batch.update(doc(db, 'campaigns', state.campaignId, 'items', item.id), patch);
    }
    await batch.commit();
  } else {
    for (const { item, root } of changes.values()) Object.assign(item, {
      containerId:target.id, originalOwnerId:originalOwnerAfterTransfer(item, target.id),
      ...(root ? { parentItemId:'' } : {}), updatedAt:nowISO(), updatedBy:state.identity.name
    });
    writeLocal();
  }
  const count = roots.length;
  state.selectedItemIds.clear();
  renderAll();
  await addHistory(`${state.identity.name} transferiu ${plural(count, 'item selecionado', 'itens selecionados')} para ${target.name}.`);
  toast(`${plural(count, 'item transferido', 'itens transferidos')} para ${target.name}.`);
}

function renderRationParticipants() {
  const checkedIds = new Set([...dom.rationParticipants.querySelectorAll('input:checked')].map((input) => input.value));
  const eligible = state.containers.filter((holder) => holder.consumesRations && num(holder.dailyRations) > 0).sort(compareHoldersForDisplay);
  if (!eligible.length) {
    dom.rationParticipants.innerHTML = `<div class="empty-state"><div aria-hidden="true"><i class="ra ra-apple"></i></div><h3>${state.containers.length ? 'Nenhum consumo configurado' : 'Configure o grupo primeiro'}</h3><p>${state.containers.length ? 'Edite um integrante e informe seu consumo diário.' : 'Adicione um personagem ou animal antes de planejar ou comprar rações.'}</p></div>`;
    return;
  }
  dom.rationParticipants.innerHTML = eligible.map((holder) => {
    const checked = checkedIds.size ? checkedIds.has(holder.id) : holder.active;
    return `<label class="participant-row"><input type="checkbox" value="${esc(holder.id)}" ${checked ? 'checked' : ''}><span><span class="participant-name">${esc(holder.name)}</span><span class="participant-detail">${esc(holderKind(holder))}</span></span><span class="participant-consumption">${formatNumber(holder.dailyRations)} / dia</span></label>`;
  }).join('');
  dom.rationParticipants.querySelectorAll('input').forEach((input) => input.addEventListener('change', renderRationCalculator));
}
function rationCalculation() {
  const selectedIds = new Set([...dom.rationParticipants.querySelectorAll('input:checked')].map((input) => input.value));
  const participants = state.containers.filter((holder) => selectedIds.has(holder.id));
  const days = Math.max(1, integer(dom.rationDays.value, 1));
  const margin = Math.max(0, num(dom.rationMargin.value));
  const price = Math.max(0, integer(dom.rationPrice.value, 0));
  const daily = participants.reduce((sum, holder) => sum + num(holder.dailyRations), 0);
  const base = Math.ceil(daily * days);
  const reserve = Math.ceil(base * margin / 100);
  const recommended = base + reserve;
  const stock = Math.floor(groupTotals().rations);
  const missing = Math.max(0, recommended - stock);
  const cost = missing * price;
  const currency = dom.rationCurrency.value;
  const payerId = dom.rationPayer.value;
  const destinationId = dom.rationDestination.value;
  const balance = holderWallet(payerId)[currency] || 0;
  return { participants, days, margin, price, daily, base, reserve, recommended, stock, missing, cost, currency, payerId, destinationId, balance };
}
function renderRationCalculator() {
  const calc = rationCalculation();
  const payer = state.containers.find((holder) => holder.id === calc.payerId);
  const destination = state.containers.find((holder) => holder.id === calc.destinationId);
  let status = '';
  let statusClass = '';
  if (!state.containers.length) { status = 'Adicione um personagem ou animal antes de planejar ou comprar rações.'; statusClass = 'error'; }
  else if (!calc.participants.length) { status = 'Selecione pelo menos um participante.'; statusClass = 'error'; }
  else if (calc.missing === 0) status = 'O estoque atual já atende ao planejamento.';
  else if (!payer || !destination) { status = 'Selecione o pagador e o destino.'; statusClass = 'error'; }
  else if (calc.balance < calc.cost) { status = `${payer.name} não possui ${calc.cost} ${calc.currency}. Saldo atual: ${formatNumber(calc.balance,0)} ${calc.currency}.`; statusClass = 'error'; }
  else status = `A compra usará ${calc.cost} ${calc.currency} de ${payer.name} e guardará ${calc.missing} rações em ${destination.name}.`;

  dom.rationResult.innerHTML = `
    <div class="result-row"><span>Consumo diário</span><strong>${formatNumber(calc.daily)} rações</strong></div>
    <div class="result-row"><span>Consumo base (${calc.days} dias)</span><strong>${formatNumber(calc.base,0)}</strong></div>
    <div class="result-row"><span>Reserva (${formatNumber(calc.margin)}%)</span><strong>${formatNumber(calc.reserve,0)}</strong></div>
    <div class="result-row"><span>Total recomendado</span><strong>${formatNumber(calc.recommended,0)}</strong></div>
    <div class="result-row"><span>Estoque do grupo</span><strong>${formatNumber(calc.stock,0)}</strong></div>
    <div class="result-row total"><span>Comprar</span><strong>${formatNumber(calc.missing,0)} rações</strong></div>
    <div class="result-row"><span>Custo</span><strong>${formatNumber(calc.cost,0)} ${esc(calc.currency)}</strong></div>
    <div class="result-row"><span>Saldo do pagador</span><strong>${formatNumber(calc.balance,0)} ${esc(calc.currency)}</strong></div>
    <div class="purchase-state ${statusClass}">${esc(status)}</div>`;
  dom.buyRationsBtn.disabled = !calc.participants.length || calc.missing <= 0 || !payer || !destination || calc.balance < calc.cost;
  dom.buyRationsBtn.textContent = calc.missing > 0 ? `Comprar ${formatNumber(calc.missing,0)} rações por ${formatNumber(calc.cost,0)} ${calc.currency}` : 'Estoque suficiente';
}
async function purchaseRations() {
  const calc = rationCalculation();
  if (!state.containers.length) throw new Error('Adicione um personagem ou animal antes de comprar rações.');
  if (!calc.participants.length) throw new Error('Selecione pelo menos um participante.');
  if (calc.missing <= 0) throw new Error('O estoque já é suficiente.');
  const payer = state.containers.find((holder) => holder.id === calc.payerId);
  const destination = state.containers.find((holder) => holder.id === calc.destinationId);
  if (!payer || !destination) throw new Error('Selecione o pagador e o destino.');
  const coinItems = state.items.filter((item) => item.containerId === calc.payerId && item.category === 'Moeda' && item.unit === calc.currency && num(item.qty) > 0);
  const existingRation = state.items.find((item) => item.containerId === calc.destinationId && item.category === 'Ração');

  if (state.mode === 'cloud') {
    const { db, doc, collection, runTransaction, serverTimestamp } = state.cloud;
    const coinRefs = coinItems.map((item) => doc(db, 'campaigns', state.campaignId, 'items', item.id));
    const rationRef = existingRation
      ? doc(db, 'campaigns', state.campaignId, 'items', existingRation.id)
      : doc(db, 'campaigns', state.campaignId, 'items', `rations_${calc.destinationId}`);
    const historyRef = doc(collection(db, 'campaigns', state.campaignId, 'history'));
    await runTransaction(db, async (transaction) => {
      const coinSnaps = [];
      for (const ref of coinRefs) coinSnaps.push(await transaction.get(ref));
      const rationSnap = await transaction.get(rationRef);
      const available = coinSnaps.reduce((sum, snap) => sum + (snap.exists() ? num(snap.data().qty) : 0), 0);
      if (available < calc.cost) throw new Error(`Saldo insuficiente. Disponível: ${formatNumber(available,0)} ${calc.currency}.`);
      let remaining = calc.cost;
      for (const snap of coinSnaps) {
        if (!snap.exists() || remaining <= 0) continue;
        const current = num(snap.data().qty);
        const debit = Math.min(current, remaining);
        remaining -= debit;
        transaction.update(snap.ref, { qty:current - debit, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
      }
      if (rationSnap.exists()) {
        transaction.update(rationRef, { qty:num(rationSnap.data().qty) + calc.missing, updatedAt:serverTimestamp(), updatedBy:state.identity.name });
      } else {
        transaction.set(rationRef, {
          name:'Rações de viagem', description:'Estoque de rações adquirido pela calculadora de viagem.', category:'Ração',
          containerId:calc.destinationId, parentItemId:'', isContainer:false, qty:calc.missing, unit:'rações', loadPerUnit:0, isBackpack:false,
          charges:0, maxCharges:0, notes:'', updatedAt:serverTimestamp(), updatedBy:state.identity.name
        });
      }
      transaction.set(historyRef, {
        text:`${state.identity.name} comprou ${calc.missing} rações por ${calc.cost} ${calc.currency}, usando as moedas de ${payer.name}, e guardou em ${destination.name}.`,
        by:state.identity.name, at:serverTimestamp()
      });
    });
  } else {
    const available = coinItems.reduce((sum, item) => sum + num(item.qty), 0);
    if (available < calc.cost) throw new Error(`Saldo insuficiente. Disponível: ${formatNumber(available,0)} ${calc.currency}.`);
    let remaining = calc.cost;
    for (const item of coinItems) {
      if (remaining <= 0) break;
      const debit = Math.min(num(item.qty), remaining);
      item.qty = num(item.qty) - debit;
      item.updatedAt = nowISO(); item.updatedBy = state.identity.name;
      remaining -= debit;
    }
    if (existingRation) existingRation.qty = num(existingRation.qty) + calc.missing;
    else state.items.push(normalizeItem({
      id:uid('item'), name:'Rações de viagem', description:'Estoque de rações adquirido pela calculadora de viagem.', category:'Ração',
      containerId:calc.destinationId, qty:calc.missing, unit:'rações', loadPerUnit:0, updatedBy:state.identity.name
    }));
    state.history.unshift({ id:uid('history'), text:`${state.identity.name} comprou ${calc.missing} rações por ${calc.cost} ${calc.currency}, usando as moedas de ${payer.name}, e guardou em ${destination.name}.`, by:state.identity.name, at:nowISO() });
    writeLocal(); renderAll();
  }
  toast('Compra registrada com sucesso.');
}

function renderGroup() {
  if (!state.containers.length) {
    dom.groupList.innerHTML = '<div class="empty-state"><div aria-hidden="true"><i class="ra ra-player"></i></div><h3>Nenhum portador</h3><p>Adicione um personagem ou animal de carga.</p></div>';
    return;
  }
  const renderHolderCard = (holder) => {
    const wallet = holderWallet(holder.id);
    const itemCount = state.items.filter((item) => item.containerId === holder.id).length;
    const load = containerLoad(holder.id); const capacity = containerCapacity(holder);
    const mine = holder.type === 'character' && holder.id === ownedCharacterId();
    return `<article class="card group-card ${mine ? 'owned-character' : ''}" data-id="${esc(holder.id)}"><div class="group-card-header"><div><h3>${esc(holder.name)}</h3><div class="group-type">${esc(holderKind(holder))}${holder.player ? ` · ${esc(holder.player)}` : ''}${mine ? '<span class="owned-character-tag">Seu personagem</span>' : ''}</div></div><span class="group-status ${holder.active ? '' : 'inactive'}">${holder.active ? 'Ativo' : 'Fora da viagem'}</span></div><div class="group-metrics"><div class="metric"><span>Carga</span><strong>${formatNumber(load)} / ${formatNumber(capacity)}</strong></div><div class="metric"><span>Itens</span><strong>${formatNumber(itemCount,0)}</strong></div><div class="metric"><span>Rações/dia</span><strong>${holder.consumesRations ? formatNumber(holder.dailyRations) : '—'}</strong></div><div class="metric"><span>Moedas</span><strong>${formatNumber(wallet.PO,0)} PO</strong></div></div><div class="coin-stack" style="justify-content:flex-start"><span class="coin-pill">${formatNumber(wallet.PO,0)} PO</span><span class="coin-pill">${formatNumber(wallet.PP,0)} PP</span><span class="coin-pill">${formatNumber(wallet.PC,0)} PC</span></div><div class="group-card-actions"><button class="button secondary small" data-holder-action="edit">Editar</button><button class="button ghost small" data-holder-action="remove">Remover</button></div></article>`;
  };
  const groups = [
    { title:'Animais de carga', holders:state.containers.filter((holder) => holder.type === 'animal').sort(compareHoldersForDisplay) },
    { title:'Personagens', holders:state.containers.filter((holder) => holder.type === 'character').sort(compareHoldersForDisplay) },
    { title:'Depósitos', holders:state.containers.filter((holder) => holder.type === 'stash').sort(compareHoldersForDisplay) }
  ];
  dom.groupList.innerHTML = groups.filter((group) => group.holders.length).map((group) => `<section class="group-section"><div class="group-section-heading"><h2>${group.title}</h2><span>${formatNumber(group.holders.length, 0)}</span></div><div class="group-section-grid">${group.holders.map(renderHolderCard).join('')}</div></section>`).join('');
  dom.groupList.querySelectorAll('[data-holder-action]').forEach((button) => button.addEventListener('click', (event) => {
    const holder = state.containers.find((candidate) => candidate.id === event.currentTarget.closest('[data-id]')?.dataset.id);
    if (!holder) return;
    if (event.currentTarget.dataset.holderAction === 'edit') openHolderDialog(holder);
    else openRemoveHolderDialog(holder);
  }));
}
function renderHistory() {
  if (!state.history.length) { dom.historyList.innerHTML = '<li><span>Nenhuma atividade registrada.</span></li>'; return; }
  dom.historyList.innerHTML = state.history.slice(0, 100).map((entry) => `<li><span>${esc(entry.text)}</span><time>${esc(formatDate(entry.at))}</time></li>`).join('');
}

function openItemDialog(item = null) {
  dom.itemForm.reset();
  dom.itemDialogTitle.textContent = item ? 'Editar item' : 'Adicionar item';
  dom.itemId.value = item?.id || '';
  populateItemDestinationSelect(item?.id || '', item ? destinationValue(item) : `holder:${state.containers[0]?.id || ''}`);
  dom.itemName.value = item?.name || '';
  dom.itemDescription.value = item?.description || '';
  dom.itemCategory.value = item?.category || 'Equipamento';
  dom.itemQty.value = item?.qty ?? 1;
  dom.itemQty.max = item?.isBackpack ? '1' : '';
  dom.itemUnit.value = item?.unit || 'un.';
  dom.itemLoad.value = item?.loadPerUnit ?? 0;
  dom.itemBackpack.checked = Boolean(item?.isBackpack);
  dom.itemIsContainer.checked = Boolean(item?.isContainer);
  dom.itemCharges.value = item?.charges ?? 0;
  dom.itemMaxCharges.value = item?.maxCharges ?? 0;
  dom.itemNotes.value = item?.notes || '';
  dom.itemDialog.showModal();
}
function itemFromForm() {
  const maxCharges = Math.max(0, num(dom.itemMaxCharges.value));
  const destination = resolveDestination(dom.itemContainer.value, dom.itemId.value);
  const existing = state.items.find((item) => item.id === dom.itemId.value);
  return normalizeItem({
    id:dom.itemId.value || null, name:dom.itemName.value.trim(), description:dom.itemDescription.value.trim(), category:dom.itemCategory.value,
    containerId:destination.containerId, parentItemId:destination.parentItemId, isContainer:dom.itemIsContainer.checked,
    qty:Math.max(0, num(dom.itemQty.value)), unit:dom.itemUnit.value,
    loadPerUnit:Math.max(0, num(dom.itemLoad.value)), isBackpack:dom.itemBackpack.checked,
    charges:Math.min(maxCharges, Math.max(0, num(dom.itemCharges.value))), maxCharges, notes:dom.itemNotes.value.trim(),
    originalOwnerId:existing ? originalOwnerAfterTransfer(existing, destination.containerId) : ''
  });
}
function applyCategoryDefaults() {
  const category = dom.itemCategory.value;
  if (category === 'Munição') dom.itemUnit.value = dom.itemName.value.toLowerCase().includes('virote') ? 'virotes' : 'flechas';
  if (category === 'Ração') dom.itemUnit.value = 'rações';
  if (category === 'Moeda' && !['PO','PP','PC'].includes(dom.itemUnit.value)) dom.itemUnit.value = 'PO';
  if (category === 'Item mágico' && num(dom.itemMaxCharges.value) === 0) { dom.itemCharges.value = 10; dom.itemMaxCharges.value = 10; }
}

function updateHolderFieldVisibility() {
  const character = dom.holderType.value === 'character';
  const stash = dom.holderType.value === 'stash';
  dom.holderPlayerLabel.classList.toggle('hidden', !character);
  dom.holderMineLabel.classList.toggle('hidden', !character);
  dom.holderStrengthLabel.classList.toggle('hidden', !character);
  dom.holderConstitutionLabel.classList.toggle('hidden', !character);
  dom.holderCapacityLabel.classList.toggle('hidden', character);
  if (stash) {
    dom.holderConsumesRations.checked = false;
    dom.holderDailyRations.value = 0;
  } else if (dom.holderDailyRations.value === '') {
    dom.holderDailyRations.value = 1;
  }
  dom.holderDailyRations.disabled = !dom.holderConsumesRations.checked;
}
function openHolderDialog(holder = null, type = 'character') {
  dom.holderForm.reset();
  const model = holder || makeHolder({ type, order:Math.max(0, ...state.containers.map((candidate) => num(candidate.order))) + 1, name:type === 'animal' ? 'Novo animal' : 'Novo personagem' });
  dom.holderDialogTitle.textContent = holder ? 'Editar portador' : type === 'animal' ? 'Adicionar animal de carga' : 'Adicionar personagem';
  dom.holderId.value = holder?.id || '';
  dom.holderName.value = model.name;
  dom.holderType.value = model.type;
  dom.holderSubtype.value = model.subtype || '';
  dom.holderPlayer.value = model.player || '';
  dom.holderMine.checked = Boolean(holder && holder.type === 'character' && holder.id === ownedCharacterId());
  dom.holderStrength.value = model.strength ?? 10;
  dom.holderConstitution.value = model.constitution ?? 10;
  dom.holderCapacity.value = model.capacity ?? (model.type === 'animal' ? 20 : 0);
  dom.holderActive.checked = model.active !== false;
  dom.holderConsumesRations.checked = model.consumesRations !== false;
  dom.holderDailyRations.value = model.dailyRations ?? (model.type === 'stash' ? 0 : 1);
  updateHolderFieldVisibility();
  dom.holderDialog.showModal();
}
function holderFromForm() {
  const type = dom.holderType.value;
  const existing = state.containers.find((holder) => holder.id === dom.holderId.value);
  return makeHolder({
    id:dom.holderId.value || uid('holder'), name:dom.holderName.value.trim(), type, subtype:dom.holderSubtype.value.trim(),
    player:dom.holderPlayer.value.trim(), order:existing?.order ?? Math.max(0, ...state.containers.map((holder) => num(holder.order))) + 1,
    strength:num(dom.holderStrength.value, 10), constitution:num(dom.holderConstitution.value, 10),
    capacity:Math.max(0, num(dom.holderCapacity.value, type === 'animal' ? 20 : 0)), active:dom.holderActive.checked,
    consumesRations:dom.holderConsumesRations.checked, dailyRations:Math.max(0, num(dom.holderDailyRations.value, 1))
  });
}
function openRemoveHolderDialog(holder) {
  if (state.containers.length <= 1) return toast('Mantenha pelo menos um portador na campanha.', 'error');
  const affected = state.items.filter((item) => item.containerId === holder.id);
  const targets = state.containers.filter((candidate) => candidate.id !== holder.id);
  dom.removeHolderId.value = holder.id;
  dom.removeHolderMessage.textContent = affected.length
    ? `${holder.name} possui ${plural(affected.length, 'tipo de item')}. Todo o conteúdo será transferido antes da remoção.`
    : `${holder.name} não possui itens. A remoção pode ser concluída imediatamente.`;
  dom.removeHolderTarget.innerHTML = targets.map((target) => `<option value="${esc(target.id)}">${esc(target.name)}</option>`).join('');
  dom.removeTargetLabel.classList.toggle('hidden', affected.length === 0);
  dom.removeHolderForm.querySelector('.button.danger').textContent = affected.length ? 'Transferir e remover' : 'Remover';
  dom.removeHolderDialog.showModal();
}

function openSettings() {
  dom.settingsCampaignName.value = state.campaign.name || '';
  dom.settingsDialog.showModal();
}
async function saveSettings() {
  const name = dom.settingsCampaignName.value.trim();
  if (!name) throw new Error('Informe o nome da campanha.');
  if (state.mode === 'cloud') {
    const { db, doc, updateDoc, serverTimestamp } = state.cloud;
    await updateDoc(doc(db, 'campaigns', state.campaignId), { name, updatedAt:serverTimestamp() });
  } else {
    state.campaign.name = name; state.campaign.updatedAt = nowISO(); writeLocal(); renderAll();
  }
  await addHistory(`${state.identity.name} atualizou as configurações da campanha.`);
}
function exportCampaign() {
  const data = JSON.stringify({ version:4, exportedAt:nowISO(), campaign:state.campaign, containers:state.containers, items:state.items, history:state.history }, null, 2);
  const blob = new Blob([data], { type:'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob); anchor.download = `old-helper-${state.campaignId}.json`; anchor.click(); URL.revokeObjectURL(anchor.href);
}
async function importCampaign(file) {
  const data = JSON.parse(await file.text());
  if (!data.campaign || !Array.isArray(data.containers) || !Array.isArray(data.items)) throw new Error('Arquivo inválido.');
  const containers = data.containers.map(normalizeHolder);
  const items = repairItemTree(data.items.map(normalizeItem), containers);
  if (state.mode === 'cloud') {
    const { db, doc, collection, getDocs, writeBatch, setDoc } = state.cloud;
    await setDoc(doc(db, 'campaigns', state.campaignId), { ...data.campaign, id:state.campaignId, name:data.campaign.name || state.campaign.name }, { merge:true });
    const [oldContainers, oldItems] = await Promise.all([
      getDocs(collection(db, 'campaigns', state.campaignId, 'containers')),
      getDocs(collection(db, 'campaigns', state.campaignId, 'items'))
    ]);
    const batch = writeBatch(db);
    oldContainers.forEach((snap) => batch.delete(snap.ref));
    oldItems.forEach((snap) => batch.delete(snap.ref));
    containers.forEach((holder) => { const payload = { ...holder }; delete payload.id; batch.set(doc(db, 'campaigns', state.campaignId, 'containers', holder.id), payload); });
    items.forEach((item) => { const payload = { ...item }; delete payload.id; batch.set(doc(db, 'campaigns', state.campaignId, 'items', item.id), payload); });
    await batch.commit();
  } else {
    state.campaign = { ...data.campaign, id:state.campaignId };
    state.containers = containers; state.items = items; state.history = data.history || [];
    writeLocal(); renderAll();
  }
  await addHistory(`${state.identity.name} importou os dados da campanha.`);
}
async function clearHistory() {
  if (!confirm('Limpar todo o registro de atividade?')) return;
  if (state.mode === 'cloud') {
    const { db, collection, getDocs, writeBatch } = state.cloud;
    const snap = await getDocs(collection(db, 'campaigns', state.campaignId, 'history'));
    const docs = snap.docs;
    for (let start = 0; start < docs.length; start += 450) {
      const batch = writeBatch(db);
      docs.slice(start, start + 450).forEach((entry) => batch.delete(entry.ref));
      await batch.commit();
    }
  } else {
    state.history = []; writeLocal(); renderHistory();
  }
}

function switchView(view, updateHash = true) {
  const valid = ['resumo','inventario','racoes','grupo','historico'];
  const next = valid.includes(view) ? view : 'resumo';
  state.activeView = next;
  document.querySelectorAll('[data-view]').forEach((button) => {
    const isActive = button.dataset.view === next;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-view-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.viewPanel === next));
  if (updateHash) {
    const url = new URL(location.href);
    url.hash = next;
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  if (next === 'racoes') renderRationCalculator();
}

function bindEvents() {
  dom.createForm.addEventListener('submit', async (event) => {
    event.preventDefault(); useLocalIdentity();
    try { await createCampaign(dom.campaignName.value.trim()); } catch (error) { toast(error.message, 'error'); }
  });
  dom.joinForm.addEventListener('submit', async (event) => {
    event.preventDefault(); useLocalIdentity();
    try { await enterCampaign(dom.joinCode.value); await addHistory(`${state.identity.name} entrou na campanha.`); } catch (error) { toast(error.message, 'error'); }
  });
  dom.joinCode.addEventListener('input', (event) => { event.target.value = normalizeCode(event.target.value); });
  dom.copyCodeBtn.addEventListener('click', async () => {
    const link = campaignShareURL();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API indisponível');
      await navigator.clipboard.writeText(link);
      toast(state.mode === 'local' ? 'Link copiado. No modo local, ele funciona somente neste navegador e origem.' : 'Link da campanha copiado.');
    } catch {
      prompt(state.mode === 'local'
        ? 'Copie o link abaixo. No modo local, ele funciona somente neste navegador e origem:'
        : 'Copie o link da campanha:', link);
    }
  });
  dom.leaveBtn.addEventListener('click', leaveCampaign);
  dom.settingsBtn.addEventListener('click', openSettings);
  dom.installBtn.addEventListener('click', requestAppInstall);
  dom.dismissInstallBtn.addEventListener('click', dismissInstallBanner);
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelectorAll('[data-go-view]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.goView)));
  window.addEventListener('hashchange', () => switchView(location.hash.slice(1), false));

  dom.bulkTransferBtn.addEventListener('click', () => bulkTransferToAnimal().catch((error) => toast(error.message, 'error')));
  dom.addItemBtn.addEventListener('click', () => {
    if (!state.containers.length) return toast('Adicione um portador antes de cadastrar itens.', 'error');
    openItemDialog();
  });
  [dom.searchInput, dom.categoryFilter, dom.containerFilter].forEach((element) => element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', renderInventory));
  dom.itemCategory.addEventListener('change', applyCategoryDefaults);
  dom.itemBackpack.addEventListener('change', () => {
    dom.itemQty.max = dom.itemBackpack.checked ? '1' : '';
    if (dom.itemBackpack.checked && num(dom.itemQty.value) > 1) dom.itemQty.value = 1;
  });
  dom.itemForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const item = itemFromForm();
      if (!item.name) throw new Error('Informe o nome do item.');
      if (!item.containerId) throw new Error('Escolha onde o item será guardado.');
      await saveItem(item); dom.itemDialog.close();
    } catch (error) { toast(error.message, 'error'); }
  });
  dom.transferForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await executeItemTransfer();
      dom.transferDialog.close();
    } catch (error) { toast(error.message, 'error'); }
  });

  [dom.rationDays, dom.rationMargin, dom.rationPrice].forEach((input) => input.addEventListener('input', renderRationCalculator));
  [dom.rationCurrency, dom.rationPayer, dom.rationDestination].forEach((select) => select.addEventListener('change', renderRationCalculator));
  dom.rationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await purchaseRations(); } catch (error) { toast(error.message, 'error'); }
  });

  dom.addCharacterBtn.addEventListener('click', () => openHolderDialog(null, 'character'));
  dom.addAnimalBtn.addEventListener('click', () => openHolderDialog(null, 'animal'));
  dom.holderType.addEventListener('change', updateHolderFieldVisibility);
  dom.holderConsumesRations.addEventListener('change', () => {
    dom.holderDailyRations.disabled = !dom.holderConsumesRations.checked;
  });
  dom.holderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const holder = holderFromForm();
      if (!holder.name) throw new Error('Informe o nome do portador.');
      if (num(dom.holderDailyRations.value) < 0) throw new Error('O consumo diário deve ser maior ou igual a zero.');
      if (holder.type !== 'character' && num(dom.holderCapacity.value) < 0) throw new Error('A capacidade deve ser maior ou igual a zero.');
      const wasOwned = holder.id === ownedCharacterId();
      await saveHolder(holder);
      if (holder.type === 'character' && dom.holderMine.checked) setOwnedCharacter(holder.id);
      else if (wasOwned) setOwnedCharacter('');
      renderAll();
      dom.holderDialog.close();
    } catch (error) { toast(error.message, 'error'); }
  });
  dom.removeHolderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const holderId = dom.removeHolderId.value;
      const hasItems = state.items.some((item) => item.containerId === holderId);
      await removeHolder(holderId, hasItems ? dom.removeHolderTarget.value : '');
      dom.removeHolderDialog.close();
      toast('Portador removido.');
    } catch (error) { toast(error.message, 'error'); }
  });

  dom.settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await saveSettings(); dom.settingsDialog.close(); } catch (error) { toast(error.message, 'error'); }
  });
  dom.clearHistoryBtn.addEventListener('click', () => clearHistory().catch(cloudError));
  dom.exportBtn.addEventListener('click', exportCampaign);
  dom.importInput.addEventListener('change', async (event) => {
    const file = event.target.files[0]; if (!file) return;
    try { await importCampaign(file); toast('Campanha importada.'); dom.settingsDialog.close(); }
    catch (error) { toast(error.message, 'error'); }
    finally { event.target.value = ''; }
  });
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', (event) => event.target.closest('dialog').close()));
  window.addEventListener('storage', (event) => { if (state.mode === 'local' && event.key === localKey(state.campaignId)) refreshLocal(); });
  state.channel?.addEventListener('message', (event) => { if (state.mode === 'local' && event.data?.type === 'update' && event.data.code === state.campaignId) refreshLocal(); });
}

async function boot() {
  let savedIdentity = null;
  try { savedIdentity = JSON.parse(localStorage.getItem('oldHelperIdentity') || 'null'); } catch {}
  if (savedIdentity) { dom.displayName.value = savedIdentity.name || ''; dom.userRole.value = savedIdentity.role || 'player'; }
  bindEvents();
  updateInstallBanner();
  await initCloud();
  state.identity = savedIdentity || { name:'Jogador', role:'player' };
  const requested = campaignCodeFromURL();
  const resume = rememberedCampaign();
  if (requested.present) {
    dom.joinCode.value = requested.code;
    useLocalIdentity();
    if (!requested.valid) toast('O código do link é inválido. Corrija-o para tentar novamente.', 'error');
    else try { await enterCampaign(requested.code); } catch (error) { toast(error.message, 'error'); }
  } else if (resume) {
    useLocalIdentity();
    try { await enterCampaign(resume); }
    catch (error) {
      if (error.message.startsWith('Campanha não encontrada')) forgetCampaign();
      else toast(error.message, 'error');
    }
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    let reloadingForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      location.reload();
    });
    navigator.serviceWorker.register('./service-worker.js', { updateViaCache:'none' })
      .then((registration) => registration.update())
      .catch(console.warn);
  }
}

boot();
