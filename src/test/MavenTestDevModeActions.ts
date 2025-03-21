/**
 * Copyright (c) 2023, 2025 IBM Corporation.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { expect } from 'chai';
import { InputBox, Workbench,SideBarView, ViewItem, ViewSection,EditorView, DefaultTreeItem ,  DebugView, VSBrowser } from 'vscode-extension-tester';
import * as utils from './utils/testUtils';
import * as constants from './definitions/constants';
import path = require('path');
import * as fs from 'fs';

describe('Devmode action tests for Maven Project', () => {
    let sidebar: SideBarView;
    let debugView: DebugView;
    let section: ViewSection;
    let menu: ViewItem[];  
    let item: DefaultTreeItem;  
    let tabs: string[];

    before(() => {
        sidebar = new SideBarView(); 
        debugView = new DebugView();        
    });

it('getViewControl works with the correct label',  async() => { 
   
   const contentPart = sidebar.getContent();
   section = await contentPart.getSection('Liberty Dashboard');   
   console.log("Found Liberty Dashboard....");
   expect(section).not.undefined; 
 
}).timeout(10000);


it('Open dasboard shows items - Maven', async () => {

  // Wait for the Liberty Dashboard to load and expand. The dashboard only expands after using the 'expand()' method.  
  await utils.delay(65000);
  section.expand();
  await utils.delay(6000);
  const menu = await section.getVisibleItems(); 
  expect(menu).not.empty;     
  item = await section.findItem(constants.MAVEN_PROJECT) as DefaultTreeItem;   
  expect(item).not.undefined;   
   
    
}).timeout(275000);


it('Start maven project from liberty dashboard', async () => {      
    
  
  await utils.launchDashboardAction(item,constants.START_DASHBOARD_ACTION,constants.START_DASHBOARD_MAC_ACTION);  
  await utils.delay(30000);
  const serverStartStatus = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
  if(!serverStartStatus)
    console.log("Server started message not found in the terminal");
  else
  {
    console.log("Server succuessfully started");  
    await utils.launchDashboardAction(item, constants.STOP_DASHBOARD_ACTION, constants.STOP_DASHBOARD_MAC_ACTION);
    const serverStopStatus= await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING);   
    if(!serverStopStatus){ 
    console.error("Server stopped message not found in the terminal");
    }
    else
      console.log("Server stopped successfully");
    expect (serverStopStatus).to.be.true;
}
 expect (serverStartStatus).to.be.true; 
 
    
}).timeout(550000);

it('start maven with docker from liberty dashboard', async () => {      

  if((process.platform === 'darwin' ) || (process.platform === 'win32'))
  {
    //skip running for platforms , enable them for linux after resolving docker setup in GHA
    return true;
  }
    
  
  await utils.launchDashboardAction(item, constants.START_DASHBOARD_ACTION_WITHDOCKER, constants.START_DASHBOARD_MAC_ACTION_WITHDOCKER);  
  await utils.delay(60000);
  const serverStartStatus = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
  if(!serverStartStatus)
    console.log("Server started message not found in the terminal");
  else
  {
    console.log("Server succuessfully started");  
    await utils.launchDashboardAction(item, constants.STOP_DASHBOARD_ACTION, constants.STOP_DASHBOARD_MAC_ACTION);    
    const serverStopStatus= await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING);
    if(!serverStopStatus){ 
    console.error("Server stopped message not found in the terminal");
    }
    else
      console.log("Server stopped successfully");
    expect (serverStopStatus).to.be.true;
}
 expect (serverStartStatus).to.be.true; 
 
    
}).timeout(350000);

it('Run tests for sample maven project', async () => {  
  
  await utils.launchDashboardAction(item, constants.START_DASHBOARD_ACTION, constants.START_DASHBOARD_MAC_ACTION);
  await utils.delay(30000);
  const serverStartStatus = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
  console.log("after checkTerminalforServerState"); 
  if(!serverStartStatus)
    console.log("Server started message not found in the terminal");
  else
  {
    console.log("Server succuessfully started");  
    await utils.launchDashboardAction(item,constants.RUNTEST_DASHBOARD_ACTION,constants.RUNTEST_DASHBOARD_MAC_ACTION);
    const testStatus = await utils.checkTestStatus(constants.MAVEN_RUN_TESTS_STRING);
    expect (testStatus).to.be.true;    
    await utils.launchDashboardAction(item, constants.STOP_DASHBOARD_ACTION, constants.STOP_DASHBOARD_MAC_ACTION);
    const serverStopStatus= await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING);
    if(!serverStopStatus){ 
    console.error("Server stopped message not found in the terminal");
    }
    else
      console.log("Server stopped successfully");
    expect (serverStopStatus).to.be.true;
}
 expect (serverStartStatus).to.be.true; 
 
    
}).timeout(350000);


it('start maven with options from liberty dashboard', async () => {      
    
  const reportPath = path.join(utils.getMvnProjectPath(),"target","site","failsafe-report.html");
  const alternateReportPath = path.join(utils.getMvnProjectPath(), "target", "reports", "failsafe.html"); // new path to scan for the reports 
  let deleteReport = await utils.deleteReports(reportPath);
  let deleteAlternateReport = await utils.deleteReports(alternateReportPath);
  expect (deleteReport && deleteAlternateReport).to.be.true; // both report files should either not exist or be successfully deleted
  await utils.launchDashboardAction(item, constants.START_DASHBOARD_ACTION_WITH_PARAM, constants.START_DASHBOARD_MAC_ACTION_WITH_PARAM);
  await utils.setCustomParameter("-DhotTests=true");  
  await utils.delay(30000);  
  const serverStartStatus = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
  if(!serverStartStatus)
    console.log("Server started with params message not found in terminal ");
  else
  {
    console.log("Server succuessfully started");  
    let checkFile = await utils.checkIfTestReportExists(reportPath);
    let checkAlternateFile = await utils.checkIfTestReportExists(alternateReportPath);
    expect (checkFile || checkAlternateFile).to.be.true; // check both potential locations for the test report, one of them must exist
    await utils.launchDashboardAction(item, constants.STOP_DASHBOARD_ACTION, constants.STOP_DASHBOARD_MAC_ACTION);    
    const serverStopStatus= await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING);
    if(!serverStopStatus){ 
    console.error("Server stopped message not found in ther terminal");
    }
    else
      console.log("Server stopped successfully");
    expect (serverStopStatus).to.be.true;
}
 expect (serverStartStatus).to.be.true;
    
}).timeout(350000);


it('start maven with history from liberty dashboard', async () => {  

  const reportPath = path.join(utils.getMvnProjectPath(),"target","site","failsafe-report.html");
  const alternateReportPath = path.join(utils.getMvnProjectPath(), "target", "reports", "failsafe.html");
  let deleteReport = await utils.deleteReports(reportPath);
  let deleteAlternateReport = await utils.deleteReports(alternateReportPath);
  expect (deleteReport && deleteAlternateReport).to.be.true;  // both report files should either not exist or be successfully deleted
  await utils.launchDashboardAction(item, constants.START_DASHBOARD_ACTION_WITH_PARAM, constants.START_DASHBOARD_MAC_ACTION_WITH_PARAM);  
  const foundCommand = await utils.chooseCmdFromHistory("-DhotTests=true");
  expect (foundCommand).to.be.true;  
  await utils.delay(30000);
  const serverStartStatus = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
  if(!serverStartStatus)
    console.log("Server started with params message not found in the terminal ");
  else
  {
    console.log("Server succuessfully started");  
    let checkFile = await utils.checkIfTestReportExists(reportPath);
    let checkAlternateFile = await utils.checkIfTestReportExists(alternateReportPath);
    expect (checkFile || checkAlternateFile).to.be.true; // check both potential locations for the test report, one of them must exist
    await utils.launchDashboardAction(item, constants.STOP_DASHBOARD_ACTION, constants.STOP_DASHBOARD_MAC_ACTION);    
    const serverStopStatus= await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING);
    if(!serverStopStatus){ 
    console.error("Server stopped message not found in terminal");
    }
    else
      console.log("Server stopped successfully");
    expect (serverStopStatus).to.be.true;
}
 expect (serverStartStatus).to.be.true;
    
}).timeout(550000);









it('View Unit test report for maven project', async () => {      
    
  await utils.launchDashboardAction(item,constants.UTR_DASHABOARD_ACTION, constants.UTR_DASHABOARD_MAC_ACTION);   
  tabs = await new EditorView().getOpenEditorTitles();
  //expect (tabs[1], "Unit test report not found").to.equal(constants.SUREFIRE_REPORT_TITLE);
  expect (tabs.indexOf(constants.SUREFIRE_REPORT_TITLE)>-1, "Unit test report not found").to.equal(true); 
    
}).timeout(10000);

it('View Integration test report for maven project', async () => {      
    
  await utils.launchDashboardAction(item, constants.ITR_DASHBOARD_ACTION, constants.ITR_DASHBOARD_MAC_ACTION);   
  tabs = await new EditorView().getOpenEditorTitles();
  //expect (tabs[2], "Integration test report not found").to.equal(constants.FAILSAFE_REPORT_TITLE);
  expect (tabs.indexOf(constants.FAILSAFE_REPORT_TITLE)>-1, "Integration test report not found").to.equal(true);
    
}).timeout(10000);

/**
 * All future test cases should be written before the test that attaches the debugger, as this will switch the UI to the debugger view.
 * If, for any reason, a test case needs to be written after the debugger test, ensure that the UI is switched back to the explorer view before executing the subsequent tests.
 */
it('attach debugger for start with custom parameter event', async () => {
  console.log("start attach debugger");
  let isServerRunning: Boolean = true;
  let attachStatus: Boolean = false;
  try {
    await utils.launchDashboardAction(item,constants.START_DASHBOARD_ACTION_WITH_PARAM, constants.START_DASHBOARD_MAC_ACTION_WITH_PARAM);
    await utils.setCustomParameter("-DdebugPort=7777");   
    await utils.delay(30000);
    
    isServerRunning = await utils.checkTerminalforServerState(constants.SERVER_START_STRING);
    if (!isServerRunning)
      console.log("Server started with params message not found in terminal");
    else {
      console.log("Server succuessfully started");
      
    await utils.launchDashboardAction(item,constants.ATTACH_DEBUGGER_DASHBOARD_ACTION, constants.ATTACH_DEBUGGER_DASHBOARD_MAC_ACTION);    
    console.log("Attach Debugger action done");
    await utils.delay(8000);
    const contentPart = debugView.getContent();
    console.log("Get Content");
    
    let mysecarry: Promise<ViewSection[]> = contentPart.getSections();    
    let mysecmap: IterableIterator<[number, ViewSection]> = (await mysecarry).entries();
    for (const [key, value] of (mysecmap)) {
      if ((await value.getEnclosingElement().getText()).includes("BREAKPOINTS")) {
        //console.log("******** mysecmap getEnclosingElement " + (await value.getEnclosingElement().getText()).valueOf());
        console.log("Found Breakpoints");
        attachStatus = true;
        break;
      }
    }

    await utils.stopLibertyserver(constants.MAVEN_PROJECT);
    isServerRunning = !await utils.checkTerminalforServerState(constants.SERVER_STOP_STRING); //negate isServerRunning
    if (!isServerRunning)
      console.log("Server stopped successfully ");
  }
  } catch (e) {
    console.error("error - ", e)
  } finally {
    console.log("finally block: is server running -  ", isServerRunning);
    if (isServerRunning) {
      utils.stopLibertyserver(constants.MAVEN_PROJECT);
    }
    else
      console.log("good to close test - Attach Debugger for start with custom parameter(-DdebugPort=7777) event");
  }
  expect(attachStatus).to.be.true;
}).timeout(350000);

  /**
   * The following after hook copies the screenshot from the temporary folder in which it is saved to a known permanent location in the project folder.
   * The MavenTestDevModeAction is the last test file that will be executed. Hence the after hook placed here
   * ensures that all the screenshots will be copied to a known permanent location in the project folder.
   */
  after(() => {
    const sourcePath = VSBrowser.instance.getScreenshotsDir();
    const destinationPath = './screenshots';

    copyFolderContents(sourcePath, destinationPath);
  });

  function copyFolderContents(sourceFolder: string, destinationFolder: string): void {
    if (!fs.existsSync(sourceFolder)) {
      return;
    }

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    const files = fs.readdirSync(sourceFolder);
    for (const file of files) {
      const sourcePath = path.join(sourceFolder, file);
      const destinationPath = path.join(destinationFolder, file);

      if (fs.statSync(sourcePath).isDirectory()) {
          copyFolderContents(sourcePath, destinationPath);
      } else {
          fs.copyFileSync(sourcePath, destinationPath);
      }
    }
  }
});

