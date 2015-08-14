// ==UserScript==
// @name        {@title}
// @author      Horza
// @date        {@date}
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/{@repoName}/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @exclude     *://*.voat.co/api*
// @exclude     *://voat.co/api*
// @version     2.22.13.32
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_openInTab
// @run-at      document-end
// @updateURL   https://github.com/HorzaGobuchul/{@repoName}/raw/master/{@fileName}_meta.user.js
// @downloadURL https://github.com/HorzaGobuchul/{@repoName}/raw/master/{@fileName}.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://github.com/domchristie/to-markdown/raw/master/dist/to-markdown.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// ==/UserScript==