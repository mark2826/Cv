// ----- دوال التطبيق الأساسية -----
function switchPane(paneId, btn) {
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(paneId + '-pane').classList.add('active');
    btn.classList.add('active');
    if(paneId === 'preview') autoScale();
}

function addEntry(listId, phTitle, phSub) {
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `<button class="del-btn" onclick="this.parentElement.remove(); updateAll();"><i class="fas fa-times"></i></button>
        <input type="text" placeholder="${phTitle}" class="ti" oninput="updateAll()">
        <textarea placeholder="${phSub}" class="su" oninput="updateAll()"></textarea>`;
    document.getElementById(listId).appendChild(div);
    updateAll();
}

function updateAll() {
    document.getElementById('p-fn').innerText = document.getElementById('fn').value || "الاسم الكامل";
    document.getElementById('p-jt').innerText = document.getElementById('jt').value || "المسمى الوظيفي";
    const contacts = [document.getElementById('ph').value, document.getElementById('em').value, document.getElementById('ad').value].filter(v=>v).join(" | ");
    document.getElementById('p-con').innerText = contacts || "معلومات التواصل";
    const sum = document.getElementById('sum').value;
    document.getElementById('p-sum-area').innerHTML = sum ? `<div class="section-header">الملخص المهني</div><div class="entry-s">${sum}</div>` : '';
    renderSection('exp-list', 'الخبرات العملية', 'p-exp-area');
    renderSection('edu-list', 'التعليم', 'p-edu-area');
    renderSection('skills-list', 'المهارات', 'p-skills-area');
    renderSection('langs-list', 'اللغات', 'p-langs-area');
    renderSocialSection();
}

function renderSection(listId, title, targetId) {
    const items = document.getElementById(listId).querySelectorAll('.item-row');
    let html = items.length > 0 ? `<div class="section-header">${title}</div>` : '';
    items.forEach(item => {
        const t = item.querySelector('.ti').value;
        const s = item.querySelector('.su').value;
        if(t || s) html += `<div class="cv-entry"><div class="entry-h">${t}</div><div class="entry-s">${s}</div></div>`;
    });
    document.getElementById(targetId).innerHTML = html;
}

function renderSocialSection() {
    const items = document.getElementById('social-list').querySelectorAll('.item-row');
    let html = items.length > 0 ? `<div class="section-header">المواقع والتواصل الاجتماعي</div>` : '';
    items.forEach(item => {
        let platform = item.querySelector('.ti').value;
        let link = item.querySelector('.su').value;
        if(platform || link) {
            if(link && !link.startsWith('http')) link = 'https://' + link;
            html += `<div class="social-item"><span class="social-platform">${platform || 'رابط'}:</span><span class="social-link">${link}</span></div>`;
        }
    });
    document.getElementById('p-social-area').innerHTML = html;
}

function autoScale() {
    const scaler = document.getElementById('cvScaler');
    if (!scaler) return;
    const availableWidth = window.innerWidth - 30;
    const paperWidth = 794;
    const scale = Math.min(availableWidth / paperWidth, 0.9);
    scaler.style.transform = `scale(${scale})`;
}

async function exportPDF() {
    const element = document.getElementById('cv-paper');
    const scaler = document.getElementById('cvScaler');
    const btn = document.querySelector('.btn-action');
    const originalTransform = scaler.style.transform;
    scaler.style.transform = 'none';
    await new Promise(r => setTimeout(r, 100));
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري التصدير...';
    btn.disabled = true;
    try {
        const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff', logging: false, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        let finalHeight = imgHeight * ratio;
        let position = 0;
        while (finalHeight > pdfHeight) {
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, finalHeight);
            pdf.addPage();
            position -= pdfHeight;
            finalHeight -= pdfHeight;
        }
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, finalHeight);
        pdf.save('السيرة_الذاتية.pdf');
    } catch(e) { alert('خطأ: '+e); }
    finally {
        scaler.style.transform = originalTransform;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function resetAll() {
    if(confirm('مسح جميع البيانات المدخلة؟')) {
        ['fn','jt','ph','em','ad','sum'].forEach(id => document.getElementById(id).value = '');
        ['exp-list','edu-list','skills-list','langs-list','social-list'].forEach(id => document.getElementById(id).innerHTML = '');
        updateAll();
    }
}

// دوال النافذة المنبثقة والنسخ
function openModal() { document.getElementById('developerModal').style.display = 'flex'; }
function closeModal() { document.getElementById('developerModal').style.display = 'none'; }
window.onclick = function(e) { if(e.target === document.getElementById('developerModal')) closeModal(); }

function copyUSDT() {
    const address = document.getElementById('usdtAddress').innerText;
    navigator.clipboard.writeText(address).then(() => {
        showToast("✅ تم نسخ عنوان شام كاش إلى الحافظة");
    }).catch(() => alert("حدث خطأ في النسخ"));
}

function showToast(msg) {
    let toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

window.addEventListener('resize', () => { if(document.getElementById('preview-pane').classList.contains('active')) autoScale(); });
window.onload = () => { updateAll(); autoScale(); };