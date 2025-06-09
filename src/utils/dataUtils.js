import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const saveFormData = (data, username) => {
  if (!username) return;

  const userKey = `invoiceApp_userData_${username}`;
  const existingData = getUserData(username) || {};

  const updatedData = {
    ...existingData,
    formData: data,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem(userKey, JSON.stringify(updatedData));
};

export const getFormData = (username) => {
  if (!username) return null;

  const userData = getUserData(username);
  return userData?.formData || null;
};

export const saveSubmittedForm = (data, username, pdfFile = null) => {
  if (!username) return;

  const userKey = `invoiceApp_userData_${username}`;
  const existingData = getUserData(username) || {};

  // Create a new submitted form entry
  const submittedForm = {
    id: Date.now().toString(),
    data: data,
    submittedAt: new Date().toISOString(),
    pdfFile: pdfFile
      ? {
          name: pdfFile.name,
          size: pdfFile.size,
          type: pdfFile.type,
          lastModified: pdfFile.lastModified,
        }
      : null,
  };

  // Add to submitted forms array
  const submittedForms = existingData.submittedForms || [];
  submittedForms.push(submittedForm);

  const updatedData = {
    ...existingData,
    submittedForms: submittedForms,
    lastSubmission: new Date().toISOString(),
  };

  localStorage.setItem(userKey, JSON.stringify(updatedData));

  // Clear current form data after successful submission
  clearFormData(username);

  return submittedForm.id;
};

export const getSubmittedForms = (username) => {
  if (!username) return [];

  const userData = getUserData(username);
  return userData?.submittedForms || [];
};

export const getUserData = (username) => {
  if (!username) return null;

  const userKey = `invoiceApp_userData_${username}`;
  const saved = localStorage.getItem(userKey);
  return saved ? JSON.parse(saved) : null;
};

export const clearFormData = (username) => {
  if (!username) return;

  const userKey = `invoiceApp_userData_${username}`;
  const existingData = getUserData(username) || {};

  const updatedData = {
    ...existingData,
    formData: null,
  };

  localStorage.setItem(userKey, JSON.stringify(updatedData));
};

export const getDummyData = () => {
  return {
    vendorName: "Acme Corporation",
    purchaseOrderNumber: "PO-2024-001",
    invoiceNumber: "INV-2024-001",
    invoiceDate: new Date().toISOString().split("T")[0],
    totalAmount: "2500.00",
    paymentTerms: "Net 30",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    glPostDate: new Date().toISOString().split("T")[0],
    description:
      "Professional services for Q1 2024 including web development, UI/UX design, and project management.",
    expenses: [
      {
        lineAmount: "1500.00",
        department: "IT",
        account: "Software",
        location: "New York",
        description: "Web development services and software licensing",
      },
      {
        lineAmount: "1000.00",
        department: "IT",
        account: "Office Supplies",
        location: "New York",
        description: "UI/UX design and project management services",
      },
    ],
    comments:
      "This invoice covers all professional services provided during Q1 2024. Please process payment within 30 days.",
  };
};

// User-specific auto-save functions
export const autoSaveFormData = (values, username) => {
  if (!username) return;

  const autoSaveKey = `invoiceApp_formData_autosave_${username}`;
  localStorage.setItem(
    autoSaveKey,
    JSON.stringify({
      data: values,
      timestamp: new Date().toISOString(),
    })
  );
};

export const getAutoSavedFormData = (username) => {
  if (!username) return null;

  const autoSaveKey = `invoiceApp_formData_autosave_${username}`;
  const saved = localStorage.getItem(autoSaveKey);
  if (!saved) return null;

  const data = JSON.parse(saved);
  // Check if autosave is from within the last 24 hours
  const savedTime = new Date(data.timestamp);
  const now = new Date();
  const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    // Clear old autosave data
    clearAutoSaveFormData(username);
    return null;
  }

  return data.data;
};

export const clearAutoSaveFormData = (username) => {
  if (!username) return;

  const autoSaveKey = `invoiceApp_formData_autosave_${username}`;
  localStorage.removeItem(autoSaveKey);
};

// PDF storage functions
export const savePDFFile = (pdfFile, username) => {
  if (!username || !pdfFile) return;

  const userKey = `invoiceApp_userData_${username}`;
  const existingData = getUserData(username) || {};

  // Store PDF file info (we can't store the actual file content in localStorage easily)
  const pdfData = {
    name: pdfFile.name,
    size: pdfFile.size,
    type: pdfFile.type,
    lastModified: pdfFile.lastModified,
    savedAt: new Date().toISOString(),
  };

  const updatedData = {
    ...existingData,
    currentPDF: pdfData,
  };

  localStorage.setItem(userKey, JSON.stringify(updatedData));
};

export const getPDFFile = (username) => {
  if (!username) return null;

  const userData = getUserData(username);
  return userData?.currentPDF || null;
};

export const clearPDFFile = (username) => {
  if (!username) return;

  const userKey = `invoiceApp_userData_${username}`;
  const existingData = getUserData(username) || {};

  const updatedData = {
    ...existingData,
    currentPDF: null,
  };

  localStorage.setItem(userKey, JSON.stringify(updatedData));
};

// Utility function to get user statistics
export const getUserStats = (username) => {
  if (!username) return null;

  const userData = getUserData(username);
  if (!userData) return null;

  const submittedForms = userData.submittedForms || [];
  const totalAmount = submittedForms.reduce((sum, form) => {
    return sum + (Number.parseFloat(form.data.totalAmount) || 0);
  }, 0);

  return {
    totalSubmissions: submittedForms.length,
    totalAmount: totalAmount,
    lastSubmission: userData.lastSubmission,
    lastUpdated: userData.lastUpdated,
  };
};

// Add a function to get the most recent submission
export const getMostRecentSubmission = (username) => {
  if (!username) return null;

  const userData = getUserData(username);
  const submittedForms = userData?.submittedForms || [];

  if (submittedForms.length === 0) return null;

  // Sort by submission date (newest first)
  const sortedForms = [...submittedForms].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  return sortedForms[0];
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);

      try {
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          textContent += strings.join(" ") + "\n";
        }

        resolve(textContent);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const parseInvoiceData = (text) => {
  const result = {
    vendorName: "",
    invoiceNumber: "",
    date: "",
    totalAmount: 0,
  };

  //  Extract vendor name (first all-uppercase line with optional punctuation)
  const vendorNameMatch = text.match(/^[A-Z][A-Z\s&.,'-]+(?=\s+\d+)/m);
  if (vendorNameMatch) {
    result.vendorName = vendorNameMatch[0].trim();
  }

  // Extract invoice number (e.g., "Invoice #: INV-2024-001")
  const invoiceMatch = text.match(/Invoice\s*(#|No\.?)\s*[:\-]?\s*(\S+)/i);
  if (invoiceMatch) {
    result.invoiceNumber = invoiceMatch[2].trim();
  }

  const dateMatch = text.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/i
  );
  if (dateMatch) {
    const rawDate = new Date(dateMatch[0]);
    const yyyy = rawDate.getFullYear();
    const mm = String(rawDate.getMonth() + 1).padStart(2, "0");
    const dd = String(rawDate.getDate()).padStart(2, "0");
    result.date = `${yyyy}-${mm}-${dd}`;
  }

  //  Extract total amount (e.g., "Total Amount: $2,500.00")
  const totalMatch = text.match(
    /Total\s*(Amount)?\s*[:\-]?\s*\$?([\d,]+\.\d{2})/i
  );
  if (totalMatch) {
    result.totalAmount = parseFloat(totalMatch[2].replace(/,/g, ""));
  }

  return result;
};
