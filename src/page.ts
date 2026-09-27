// Runs in the page's own JS context (manifest "world": "MAIN") at
// document_start, before the site's scripts.
import { InstallSearchByName } from "./SearchByName";

InstallSearchByName();
