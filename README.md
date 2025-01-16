# Hide custom elements in selected pages.
Add new rules in the beginning of file _content.js_


- A floating icon like in the other extension I showed you. when clicked, the page is reloaded, the icon is changed to different image, and the display:none applies. when clicked again on the icon, the page reloads and all the display none cancelled, and the original CSS returns.

- Just rememebr the icon has a fixed position on screen.scrolling up/down does not change it's position

- What if he refreshes this tab several times or many time? Will the state S be kept? (Yes)
- If he opens a new tab manually (CTRL + t, not by clicking at any URLs in the current site), and visits XYZ.com in another tab, what is the state of this new Tab (S or !S) ? (Yes, S)
- If he closes the all the tabs whose URL is XYZ.com, and revisit XYZ.com after that, will S be kept? (Answer: No)
- If he closes all the browser windows, or restart the machine, will S be kept? (Answwer: No)

- I can explain the logic much better. when it's turned "on" it is turned ON for current tab and all **future **tabs of the same domain until browser is closed or until it's turned OFF. and vice versa:
- When the extension ON and then turned OFF for one specific XYZ.COM tab, it will be OFF for all future tabs of XYZ
- We do not refresh non-active tabs already opened.
- So, theoretically speaking, If I have 10 tabs opened for same domain, and I've activated the extension for one tab, it will be OFF for the other 9 tabs. if the user will go to one of the other 9 tabs, and refresh one of them, or move to a different page - it will be ON again, but still OFF on the other 8 pages and so on. We do not refresh inactive tabs even if we know what the state of the domain should be.

