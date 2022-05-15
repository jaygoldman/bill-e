

let libraryItems = [];
let preferences = {mode:'send', address:'', download:'csv'};
let currentPercentComplete = 0;

/*********************************************************************
 * Check if we're on read.amazon.com. We only run the actual library
 * retrieval if we're on the right site
 *********************************************************************/

browser.tabs.getSelected(null, function(tab) {
    if(tab.url.startsWith('https://read.amazon.com')){
        
        // Hide the blocker
        document.querySelector('#not_read_amazon_com').style.display = 'none';
        
        // Add the event listeners for the Activity/Settings tabs
        document.querySelector('#tabs_selector_activity').addEventListener('click', e => {
            switchTab('activity');
        })
        document.querySelector('#tabs_selector_settings').addEventListener('click', e => {
            switchTab('settings');
        })
        
        // Add the event listeners for the Activity tab
        document.querySelector('#activity_action_button').addEventListener('click', e => {
            activityButtonAction();
        })
        
        // Add the event listeners for the Settings tab
        document.querySelector('#settings_action_button').addEventListener('click', e => {
            setPreferences();
        })
        document.querySelector('#bille_mode_send').addEventListener('click', e => {
            toggleSettingsMode('send');
        })
        document.querySelector('#bille_mode_download').addEventListener('click', e => {
            toggleSettingsMode('download');
        })
        
        // Get the preferences and set the Settings tab
        console.log('BILL-E: window setup complete. Getting preferences.');
        getPreferences();
        
        
        // Get the library
        console.log('BILL-E: preferences complete. Getting library.');
        libraryItems = getLibrary();
        
        // Enable the action button if we got something back
        if(libraryItems && libraryItems.length > 0){
            document.querySelector('#activity_action_button').disabled = false;
        }
    }
});

/*********************************************************************
 * getPreferences()
 * Retrieves the preferences localStorage if it exists. Set it to the
 * defaults if they don't exist already.
 *********************************************************************/

function getPreferences(){
    let modePref = window.localStorage.getItem('modePref');
    let addressPref = window.localStorage.getItem('addressPref');
    let downloadPref = window.localStorage.getItem('downloadPref');
    
    console.log('BILL-E: retrieved preferences - mode:' + modePref + ' address: ' + addressPref + ' download:' + downloadPref);
    
    if(modePref && modePref != ''){
        preferences.mode = modePref;
        console.log('BILL-E: mode is ' + preferences.mode);
        
        switch(modePref){
            case 'send':
                toggleSettingsMode('send');
                break;
            
            case 'download':
                toggleSettingsMode('download');
                break;
        }
    }else{
        // Set to the default, which is 'send'
        console.log('BILL-E: mode is default - ' + preferences.mode);
        window.localStorage.setItem('modePref', preferences.mode);
    }
    
    if(addressPref && addressPref != ''){
        preferences.address = addressPref;
        console.log('BILL-E: address is ' + preferences.address);
        
        document.querySelector('#bille_send_address').value = addressPref;
    }else{
        // Set to the default, which is ''
        console.log('BILL-E: address is default - ' + preferences.address);
        window.localStorage.setItem('addressPref', preferences.address);
    }
    
    if(downloadPref && downloadPref != ''){
        preferences.download = downloadPref;
        console.log('BILL-E: download is ' + preferences.download);
        
        switch(downloadPref){
            case 'csv':
                document.querySelector('#bille_download_csv').checked = true;
                document.querySelector('#bille_download_json').checked = false;
                break;
            
            case 'json':
                document.querySelector('#bille_download_csv').checked = false;
                document.querySelector('#bille_download_json').checked = true;
                break;
        }
    }else{
        // Set to the default, which is 'csv'
        console.log('BILL-E: download is default - ' + preferences.download);
        window.localStorage.setItem('downloadPref', preferences.download);
    }
    
    toggleActivityButton();
}

/*********************************************************************
 * setPreferences()
 * Sets the preferences cookie
 *********************************************************************/

function setPreferences(){
    
    // Get the current value of the controls and update preferences
    if(document.querySelector('#bille_mode_send').checked){
        preferences.mode = 'send';
    }else if(document.querySelector('#bille_mode_download').checked){
        preferences.mode = 'download';
    }
    
    preferences.address = document.querySelector('#bille_send_address').value;
    
    if(document.querySelector('#bille_download_csv').checked){
        preferences.download = 'csv';
    }else if(document.querySelector('#bille_download_json').checked){
        preferences.download = 'json';
    }
    
    window.localStorage.setItem('modePref', preferences.mode);
    window.localStorage.setItem('addressPref', preferences.address);
    window.localStorage.setItem('downloadPref', preferences.download);
    
    toggleActivityButton();
    
    document.querySelector('#settings_action_complete').style.display = 'block';
    setTimeout(function () {
        document.querySelector('#settings_action_complete').style.display = 'none';
    }, 3000);
}

/*********************************************************************
 * switchTab()
 * Handles clicks on the Activity/Settings tabs
 *********************************************************************/

function switchTab(targetTab){
    const activityTab = document.querySelector('#tabs_selector_activity');
    const activityContent = document.querySelector('#tabs_content_activity');
    const settingsTab = document.querySelector('#tabs_selector_settings');
    const settingsContent = document.querySelector('#tabs_content_settings');

    if(targetTab == 'activity'){
        activityTab.classList.add('tabs_selected');
        settingsTab.classList.remove('tabs_selected');

        activityContent.classList.add('tabs_visible');
        settingsContent.classList.remove('tabs_visible');
    }else if(targetTab == 'settings'){
        activityTab.classList.remove('tabs_selected');
        settingsTab.classList.add('tabs_selected');
        
        activityContent.classList.remove('tabs_visible');
        settingsContent.classList.add('tabs_visible');
    }
}

/*********************************************************************
 * updateActivity()
 * Update the Activity Tab display percentage and message. Usually this
 * goes by too quickly to even see but you might have a very large library
 * and see a few pages.
 *********************************************************************/

function updateActivity(percentage = null, message = null){
    if(percentage && percentage > 0 && percentage <= 100){
        currentPercentComplete = percentage;
        document.querySelector('#activity_progress_percent').style.width = percentage + '%';
        document.querySelector('#activity_progress_percent').innerHTML = percentage + '%';
        
        if(percentage == 100){
            console.log('BILL-E: library download complete.');
            document.querySelector('#activty_spinner').style.display = 'none';
            document.querySelector('#activity_action_button').disabled = false;
        }
    }
    if(message){
        document.querySelector('#activity_progress_step').innerHTML = message;
    }
}

/*********************************************************************
 * toggleActivityButton()
 * Switches the label on the button on the Activity tab
 *********************************************************************/

function toggleActivityButton(){
    switch(preferences.mode){
        case 'send':
            document.querySelector('#activity_action_button').innerHTML = 'Send to BILL-E';
            break;
        
        case 'download':
            document.querySelector('#activity_action_button').innerHTML = 'Download Library (' + preferences.download.toUpperCase() + ')';
            break;
    }
}

/*********************************************************************
 * activityButtonAction()
 * Handles clicks on the button the activity tab to either send or
 * download the library
 *********************************************************************/

function activityButtonAction(){
    
    switch(preferences.mode){
        case 'send':
            // TODO: update when the server supports receiving the library
            document.querySelector('#activity_action_complete').innerHTML = 'Sent to BILL-E';
            break;
        
        case 'download':
            switch(preferences.download){
                case 'csv':
                    let csvData = itemsToCSV(libraryItems);
                    window.open('data:text/csv;charset=utf8,' + encodeURIComponent(csvData));
                    document.querySelector('#activity_action_complete').innerHTML = 'CSV download complete';
                    break;
                
                case 'json':
                    window.open('data:application/json;charset=utf8,' + encodeURIComponent(JSON.stringify(libraryItems)));
                    document.querySelector('#activity_action_complete').innerHTML = 'JSON download complete';
                    break;
            }
            break;
    }
    
    document.querySelector('#activity_action_complete').style.display = 'block';
    setTimeout(function () {
        document.querySelector('#activity_action_complete').style.display = 'none';
    }, 3000);
}

/*********************************************************************
 * toggleSettingsMode()
 * Handle the enabling/disabling of settings controls
 *********************************************************************/

function toggleSettingsMode(newMode = null){
    if(newMode){
        switch(newMode){
            case 'send':
                document.querySelector('#bille_mode_send').checked = true;
                document.querySelector('#bille_mode_download').checked = false;
                
                document.querySelector('#bille_send_address').disabled = false;
                document.querySelector('#bille_download_csv').disabled = true;
                document.querySelector('#bille_download_json').disabled = true;
                break;
            case 'download':
                document.querySelector('#bille_mode_send').checked = false;
                document.querySelector('#bille_mode_download').checked = true;
                
                document.querySelector('#bille_send_address').disabled = true;
                document.querySelector('#bille_download_csv').disabled = false;
                document.querySelector('#bille_download_json').disabled = false;
                break;
        }
        
        toggleActivityButton();
    }
}


/*********************************************************************
 * getLibary()
 * The primary function for retrieving the Kindle catalog as a JavaScript array
 *********************************************************************/

function getLibrary(){
    let xhr = new XMLHttpRequest();
    let items = [];

    // Use the xhr object to iteratively call getItemPage for each paginationToken
    // until it doesn't return more items.
    xhr.onreadystatechange = function() {
        switch(xhr.readyState){
            case 0:
                console.log('BILL-E: request unsent');
                break;
            case 1:
                updateActivity(10, 'Hello? Amazon?');
                break;
            case 2:
                updateActivity(20, 'Contact established');
                break;
            case 3:
                updateActivity(30, 'Getting stuff...');
                break;
            case 4:
                if(xhr.status == 200) {
                    let data = xhr.responseText;
                    data = JSON.parse(data);
                    if(data.itemsList){
                        items.push(...data.itemsList);
                    }
                    if(data.paginationToken){
                        console.log('BILL-E: received up to item ' + data.paginationToken);
                        updateActivity((currentPercentComplete < 95 ? currentPercentComplete + 5 : currentPercentComplete), 'Got back items up to ' + data.paginationToken);
                        getItemPage(data.paginationToken, xhr);
                    }
                } else {
                    updateActivity(100, 'Sorry! Failed to get the library (code: ' + xhr.status + ')');
                    console.log('BILL-E: failed to retrieve the library (code: ' + xhr.status + ')');
                }
                break;
        }
    }

    // Start getting the library on the first page
    getItemPage(null, xhr);
    
    // Return the JSON object of items
    console.log('BILL-E: ' + items.length + ' item(s) received');
    updateActivity(100, 'Done! All ' + items.length + ' items retrieved.');
    return items;
}

/*********************************************************************
 * getItemPage()
 * Kindle's own method for returning the library is paged so getItemPage()
 * returns one page at a time and is called iteratively by getLibrary().
 *********************************************************************/

function getItemPage(paginationToken = null, xhr = null) {
    if(xhr){
        let url = 'https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS' + (paginationToken ? '&paginationToken=' + paginationToken : '') + '&sortType=recency&querySize=50';
        xhr.open('GET', url, false);
        xhr.send();
    }
}

/*********************************************************************
 * itemsToCSV()
 * Convert the library array to a CSV string
 *********************************************************************/

function itemsToCSV(items = null){
    let csvData = '';
    
    if(items){
        items.forEach(item => {
            csvData += '"' + item.asin + '","' + csvTitle(item.title) + '"\n';
        })

         return csvData;
    }
}

/*********************************************************************
 * csvTitle()
 * Returns a title as an escaped CSV string for quotes and commas
 *********************************************************************/

function csvTitle(title = null) {
    var cleanTitle;
    if (title) {
        cleanTitle = title.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm,' ');
        cleanTitle = cleanTitle.replace(/,/g, '\,');
        cleanTitle = cleanTitle.replace(/"/g, '""');
        cleanTitle = cleanTitle.replace(/'/g, '\'');
        cleanTitle = cleanTitle.replace(/ +(?= )/g,'');
    } else {
        cleanTitle = '';
    }
    return cleanTitle;
}
    
