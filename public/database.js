let db;
// This creates a new database request for the Budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    // This creates an object store called "pending" and it sets the autoIncrement as true
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    // This checks checks to see if the app is online before reading from the data base
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    // This creates a transaction on the pending data base with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");

    // This accesses your pending object store
    const store = transaction.objectStore("pending");

    // This adds record to your store with add method.
    store.add(record);
}

function checkDatabase() {
    // This opens a transaction on your pending data base
    const transaction = db.transaction(["pending"], "readwrite");

    // This accesses your pending object store
    const store = transaction.objectStore("pending");

    // This gets all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })

            .then(response => response.json())
        .then(() => {
          // If successful, open a transaction on your pending data base
          const transaction = db.transaction(["pending"], "readwrite");

          // This accesses your pending object store
          const store = transaction.objectStore("pending");

          // This clears all items in your store
          store.clear();
        });
    }
  };
}

// This listens for app coming back online
window.addEventListener("online", checkDatabase);