# Study Report: IT Support / Helpdesk — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Enterprise IT support career path covering CompTIA A+ hardware and software concepts, structured troubleshooting, Windows and Linux administration, TCP/IP networking, ticketing systems, remote support, Active Directory basics, and ITIL service management. Built from Microsoft Learn, CompTIA objectives, and Ubuntu/Linux documentation for hands-on helpdesk work.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

## Recommended books (read alongside this report)

### 1. CompTIA A+ Complete Study Guide — Quentin Docter et al.
- **Level:** Beginner
- **Focus:** Hardware, OS, networking, and troubleshooting for helpdesk roles.
- **Link:** https://www.wiley.com/en-us/CompTIA+A%2B+Complete+Study+Guide%2C+5th+Edition-p-9781119863747

### 2. The Practice of System and Network Administration — Thomas Limoncelli et al.
- **Level:** Intermediate
- **Focus:** Enterprise IT operations, monitoring, and incident handling.
- **Link:** https://the-sysadmin-book.com/

### 3. Windows Client Documentation — Microsoft Learn *(free online)*
- **Level:** Beginner
- **Focus:** Windows 11 administration, troubleshooting, and Intune basics.
- **Link:** https://learn.microsoft.com/windows/

### 4. ITIL 4 Foundation — AXELOS
- **Level:** Beginner
- **Focus:** IT service management framework used by global helpdesks.
- **Link:** https://www.axelos.com/certifications/itil-service-management/itil-4-foundation

### 5. The Linux Command Line — William Shotts *(free online)*
- **Level:** Beginner
- **Focus:** Free book for Linux shell, files, permissions, and scripting.
- **Link:** https://linuxcommand.org/tlcl.php

## End-to-end projects

### Project 1: Helpdesk Ticket Simulation Lab
- **Level:** Beginner | **Duration:** 1–2 weeks
- **Overview:** Process 20 simulated tickets: triage, troubleshoot, document resolution, calculate SLA metrics.
- **Objectives:**
  - Triage 20 tickets by priority
  - Document resolution steps
  - Calculate average resolution time
  - Create KB article
- **Phases:**
  - **Triage:** Priority matrix. Tasks: P1-P4 classification, Assignment. Deliverable: Triage spreadsheet.
  - **Resolve:** Fix 20 scenarios. Tasks: Password reset, Network, Software. Deliverable: Resolution log.
  - **KB:** Write 3 KB articles. Tasks: Step-by-step, Screenshots. Deliverable: KB articles PDF.
  - **Metrics:** SLA report. Tasks: Avg resolution, First contact rate. Deliverable: SLA dashboard.
- **Final deliverables:** 20 ticket resolutions; 3 KB articles; SLA report

### Project 2: Small Office IT Setup
- **Level:** Intermediate | **Duration:** 2–3 weeks
- **Overview:** Design and document network for 15 users: IP plan, Active Directory, backup, security baseline.
- **Objectives:**
  - Network diagram with IP addressing
  - AD user/group structure
  - Backup policy document
  - Security baseline checklist
- **Phases:**
  - **Network:** IP plan and diagram. Tasks: Subnet, VLAN, Firewall rules. Deliverable: Network diagram Visio/draw.io.
  - **AD:** User and group design. Tasks: OUs, GPO basics. Deliverable: AD structure doc.
  - **Backup:** 3-2-1 backup policy. Tasks: Schedule, Restore test. Deliverable: Backup policy PDF.
  - **Security:** Baseline hardening. Tasks: MFA, Patch policy, AV. Deliverable: Security checklist signed off.
- **Final deliverables:** Network diagram; AD design; Backup policy; Security baseline

### Project 3: Incident Response Tabletop Exercise
- **Level:** Advanced | **Duration:** 3–4 weeks
- **Overview:** Simulate ransomware incident: detect, contain, eradicate, recover, and write post-incident report.
- **Objectives:**
  - Incident response plan document
  - Tabletop exercise with timeline
  - Containment playbook
  - Post-incident report with lessons learned
- **Phases:**
  - **Plan:** IR plan document. Tasks: Roles, Escalation, Contacts. Deliverable: IR plan PDF.
  - **Simulate:** Ransomware scenario. Tasks: Detection, Isolation steps. Deliverable: Exercise timeline.
  - **Contain:** Execute containment. Tasks: Network isolate, Backup restore. Deliverable: Containment log.
  - **Report:** Post-incident review. Tasks: Root cause, Improvements. Deliverable: PIR document.
- **Final deliverables:** IR plan; Exercise timeline; PIR document; Updated playbook

## Chapters

---

### Track: Beginner

#### Chapter 1: IT Support Role and Service Desk Tiers *(Level: Beginner)*

**Chapter focus: IT Support Role and Service Desk Tiers** *(Level: Beginner)*

IT support keeps employees productive by resolving hardware, software, and access issues. Tier 1 handles password resets, software installs, and common errors. Tier 2 tackles network, server, and application issues. Tier 3 and engineering own root cause fixes. Every interaction requires empathy, clear language, and accurate ticket notes.

Code Reference:
```powershell
# Tier 1: intake -> triage -> resolve -> document
# Tier 2: escalate with full context and logs attached
```
What it shows: Support tiers define scope and escalation paths.

### What it actually is
IT support is frontline technical assistance for organizational users.

### When to use it
When users cannot work due to technology failures.

### Where to use it
Corporate helpdesks, schools, hospitals, MSPs, and SaaS internal IT.

### Real use example
A teacher cannot open PDF reports; Tier 1 confirms browser cache issue, clears it, and closes the ticket in 12 minutes.

**Key takeaways**
- IT support is frontline technical assistance for organizational users.
- When users cannot work due to technology failures.
- A teacher cannot open PDF reports; Tier 1 confirms browser cache issue, clears it, and closes the ticket in 12 minutes.

#### Chapter 2: CompTIA A+ Hardware Fundamentals *(Level: Beginner)*

**Chapter focus: CompTIA A+ Hardware Fundamentals** *(Level: Beginner)*

A+ Core 1 covers motherboards, CPU, RAM, storage (SSD/HDD/NVMe), power supplies, and peripherals. Support techs identify failed components, reseat cables, run diagnostics, and order replacements. Understand form factors, POST beep codes, and safe ESD handling.

Code Reference:
```powershell
Get-CimInstance Win32_PhysicalMemory | Select Capacity, Speed
Get-PhysicalDisk | Select FriendlyName, MediaType, HealthStatus
```
What it shows: PowerShell queries RAM and disk health on Windows endpoints.

### What it actually is
Hardware fundamentals are the physical layer of troubleshooting.

### When to use it
When devices fail POST, overheat, or show storage errors.

### Where to use it
Desktop support, laptop repair, and datacenter walk-throughs.

### Real use example
Laptop won't boot; tech reseats RAM stick after beep code chart points to memory failure.

**Key takeaways**
- Hardware fundamentals are the physical layer of troubleshooting.
- When devices fail POST, overheat, or show storage errors.
- Laptop won't boot; tech reseats RAM stick after beep code chart points to memory failure.

#### Chapter 3: CompTIA A+ Software and OS Concepts *(Level: Beginner)*

**Chapter focus: CompTIA A+ Software and OS Concepts** *(Level: Beginner)*

Core 2 covers Windows editions, macOS basics, Linux distributions, mobile OS, and application installation. Know 32 vs 64-bit, driver management, Windows Update, Task Manager, and safe mode. Image deployment and user profile migration are common enterprise tasks.

Code Reference:
```powershell
Get-Process | Sort-Object CPU -Descending | Select -First 10
Get-WmiObject Win32_OperatingSystem | Select Caption, Version
```
What it shows: Identify runaway processes and confirm OS version before patching.

### What it actually is
OS concepts explain how software runs on hardware.

### When to use it
During malware cleanup, performance issues, and upgrade planning.

### Where to use it
All endpoint support roles.

### Real use example
PC runs slow; support finds Chrome using 4 GB RAM and advises tab limits plus extension audit.

**Key takeaways**
- OS concepts explain how software runs on hardware.
- During malware cleanup, performance issues, and upgrade planning.
- PC runs slow; support finds Chrome using 4 GB RAM and advises tab limits plus extension audit.

#### Chapter 4: Windows Administration for Support Techs *(Level: Beginner)*

**Chapter focus: Windows Administration for Support Techs** *(Level: Beginner)*

Support techs reset passwords in Active Directory, manage local admins, check Event Viewer, restart services, and use Settings vs Control Panel. PowerShell cmdlets like Get-Service, Restart-Service, and Get-EventLog speed repetitive tasks.

Code Reference:
```powershell
Get-ADUser -Identity jsmith -Properties PasswordLastSet, LockedOut
Unlock-ADAccount -Identity jsmith
```
What it shows: Check lockout state and unlock without unnecessary password reset.

### What it actually is
Windows admin skills let support fix account and service issues locally and in AD.

### When to use it
Daily password, printer, and software ticket work.

### Where to use it
Domain-joined corporate laptops and VDI pools.

### Real use example
User locked out after vacation; support unlocks account and confirms MFA device is registered.

**Key takeaways**
- Windows admin skills let support fix account and service issues locally and in AD.
- Daily password, printer, and software ticket work.
- User locked out after vacation; support unlocks account and confirms MFA device is registered.

#### Chapter 5: Linux Command Line for Support *(Level: Beginner)*

**Chapter focus: Linux Command Line for Support** *(Level: Beginner)*

Many servers and cloud VMs run Linux. Support uses ssh, ls, cd, cat, grep, systemctl, journalctl, and tail -f for log review. File permissions (chmod/chown) and package managers (apt, yum) fix common service failures.

Code Reference:
```bash
ssh admin@server01
sudo systemctl status nginx
sudo journalctl -u nginx --since '1 hour ago'
```
What it shows: Remote session checks web server status and recent error logs.

### What it actually is
Linux CLI is essential for server-side support and DevOps handoffs.

### When to use it
When applications run on Ubuntu/RHEL in AWS or Azure.

### Where to use it
Web app support, database servers, and container hosts.

### Real use example
Website down; support ssh in, finds nginx stopped, runs systemctl start nginx, verifies with curl.

**Key takeaways**
- Linux CLI is essential for server-side support and DevOps handoffs.
- When applications run on Ubuntu/RHEL in AWS or Azure.
- Website down; support ssh in, finds nginx stopped, runs systemctl start nginx, verifies with curl.

#### Chapter 6: Customer Communication and Soft Skills *(Level: Beginner)*

**Chapter focus: Customer Communication and Soft Skills** *(Level: Beginner)*

Technical skill alone is insufficient. Use active listening, avoid jargon with non-technical users, set time expectations, and confirm resolution. Document every step in the ticket so the next shift can continue. De-escalate frustrated callers with empathy and status updates.

Code Reference:
```text
# Ticket note template:
# Issue: ... | Steps tried: ... | Resolution: ... | User confirmed: Y/N
```
What it shows: Structured notes improve handoffs and SLA reporting.

### What it actually is
Soft skills turn technical fixes into positive user experiences.

### When to use it
Every user-facing support interaction.

### Where to use it
Phone, chat, walk-up bar, and remote support.

### Real use example
Executive upset about email delay; tech explains maintenance window, offers mobile workaround, schedules follow-up.

**Key takeaways**
- Soft skills turn technical fixes into positive user experiences.
- Every user-facing support interaction.
- Executive upset about email delay; tech explains maintenance window, offers mobile workaround, schedules follow-up.

---

### Track: Intermediate

#### Chapter 7: Structured Troubleshooting Methodology *(Level: Intermediate)*

**Chapter focus: Structured Troubleshooting Methodology** *(Level: Intermediate)*

Follow identify, establish theory, test, plan, implement, verify, document. CompTIA emphasizes dividing problems (hardware vs software vs network) and checking simplest causes first (cables, reboot, recent changes). Never skip verification with the user.

Code Reference:
```text
1. Reproduce  2. Isolate variable  3. Test hypothesis  4. Verify fix  5. Root cause note
```
What it shows: Repeatable methodology prevents random guessing.

### What it actually is
Structured troubleshooting is a systematic diagnostic process.

### When to use it
Every non-trivial incident.

### Where to use it
Tier 1 and Tier 2 daily work.

### Real use example
Outlook sync fails only on Wi-Fi; tech disables VPN split tunnel conflict and confirms calendar sync.

**Key takeaways**
- Structured troubleshooting is a systematic diagnostic process.
- Every non-trivial incident.
- Outlook sync fails only on Wi-Fi; tech disables VPN split tunnel conflict and confirms calendar sync.

#### Chapter 8: TCP/IP, DNS, and DHCP Essentials *(Level: Intermediate)*

**Chapter focus: TCP/IP, DNS, and DHCP Essentials** *(Level: Intermediate)*

Understand IPv4 addressing, subnet masks, default gateway, and DHCP lease renewal. DNS translates names to IPs; stale DNS causes 'site not found' after migrations. Tools: ipconfig /all, ping, tracert, nslookup, and Test-NetConnection.

Code Reference:
```powershell
ipconfig /all
nslookup codequest.app
Test-NetConnection codequest.app -Port 443
```
What it shows: Full stack check from IP config through DNS to HTTPS port.

### What it actually is
Networking fundamentals explain most connectivity tickets.

### When to use it
Cannot reach internal apps, websites, or VPN resources.

### Where to use it
Remote work, office LAN, and hybrid cloud access.

### Real use example
After datacenter move, users hit old IP; flushing DNS and verifying A record fixes access.

**Key takeaways**
- Networking fundamentals explain most connectivity tickets.
- Cannot reach internal apps, websites, or VPN resources.
- After datacenter move, users hit old IP; flushing DNS and verifying A record fixes access.

#### Chapter 9: Remote Support Tools and VPN *(Level: Intermediate)*

**Chapter focus: Remote Support Tools and VPN** *(Level: Intermediate)*

Remote tools include Quick Assist, TeamViewer, RDP, and SSH. VPN connects users to corporate networks; split tunnel vs full tunnel affects performance and security. Always obtain user consent before remote control.

Code Reference:
```powershell
mstsc /v:workstation-42
# Or: ssh -L 8080:localhost:80 jump-host
```
What it shows: RDP for Windows; SSH tunnel for secure port forwarding.

### What it actually is
Remote support enables fix-without-truck-roll.

### When to use it
Work-from-home and branch office scenarios.

### Where to use it
Global enterprises and MSP remote desks.

### Real use example
Field sales rep cannot reach CRM; support confirms VPN client outdated, pushes new profile.

**Key takeaways**
- Remote support enables fix-without-truck-roll.
- Work-from-home and branch office scenarios.
- Field sales rep cannot reach CRM; support confirms VPN client outdated, pushes new profile.

#### Chapter 10: Ticketing Systems and SLA Management *(Level: Intermediate)*

**Chapter focus: Ticketing Systems and SLA Management** *(Level: Intermediate)*

Tickets track priority (P1-P4), category, assignment group, and SLA clocks (response vs resolution). Breached SLAs escalate automatically. Good categorization enables trend reporting and problem management.

Code Reference:
```text
Priority = f(impact, urgency)
P1: many users / critical app down
P4: single user / low impact
```
What it shows: Impact × urgency matrix drives priority.

### What it actually is
Ticketing is the system of record for IT support work.

### When to use it
All professional IT organizations.

### Where to use it
ServiceNow, Jira SM, Zendesk, Freshservice.

### Real use example
Email outage for 200 users logged P1; SLA page fires on-call engineer within 15 minutes.

**Key takeaways**
- Ticketing is the system of record for IT support work.
- All professional IT organizations.
- Email outage for 200 users logged P1; SLA page fires on-call engineer within 15 minutes.

#### Chapter 11: Active Directory and Account Management *(Level: Intermediate)*

**Chapter focus: Active Directory and Account Management** *(Level: Intermediate)*

AD stores users, groups, computers, and Group Policy. Support creates/disables accounts, resets passwords, adds group membership, and troubleshoots GPO application with gpresult. Azure AD Connect syncs hybrid identities.

Code Reference:
```powershell
Get-ADGroupMember 'VPN-Users'
gpresult /R /SCOPE USER
```
What it shows: Verify group membership and applied GPO on user login.

### What it actually is
Active Directory is the identity backbone of Windows enterprises.

### When to use it
Onboarding, offboarding, and access issues.

### Where to use it
Hybrid Microsoft 365 environments.

### Real use example
New hire missing SharePoint access; support adds to SG-Finance-Users, user logs off/on, access works.

**Key takeaways**
- Active Directory is the identity backbone of Windows enterprises.
- Onboarding, offboarding, and access issues.
- New hire missing SharePoint access; support adds to SG-Finance-Users, user logs off/on, access works.

#### Chapter 12: ITIL Service Management Basics *(Level: Intermediate)*

**Chapter focus: ITIL Service Management Basics** *(Level: Intermediate)*

ITIL 4 defines value co-creation through services. Key practices: incident (restore service), problem (root cause), change (controlled modification), and request fulfillment. Service catalog lists standard offerings; CMDB supports impact analysis.

Code Reference:
```text
Incident -> (workaround) -> Problem -> Known Error -> Change -> Release
```
What it shows: Practice chain from firefight to permanent fix.

### What it actually is
ITIL provides common language for IT service delivery.

### When to use it
Mature IT departments aligning support with business outcomes.

### Where to use it
Enterprises, government, and regulated industries.

### Real use example
Recurring printer driver crash becomes problem record; known error published until patch change.

**Key takeaways**
- ITIL provides common language for IT service delivery.
- Mature IT departments aligning support with business outcomes.
- Recurring printer driver crash becomes problem record; known error published until patch change.

#### Chapter 13: Security Basics for Support Staff *(Level: Intermediate)*

**Chapter focus: Security Basics for Support Staff** *(Level: Intermediate)*

Support is a phishing target with elevated credentials. Verify caller identity before password resets. Recognize social engineering. Enforce MFA enrollment. Never share admin passwords. Report suspicious emails to SOC.

Code Reference:
```text
# Before reset: verify employee ID + manager approval for VIP accounts
```
What it shows: Identity verification prevents account takeover via fake support calls.

### What it actually is
Security-aware support reduces insider-threat and social-engineering risk.

### When to use it
Every password reset and remote session.

### Where to use it
Helpdesks with AD and privileged tool access.

### Real use example
Attacker impersonates CFO; tech follows callback procedure and blocks attempt.

**Key takeaways**
- Security-aware support reduces insider-threat and social-engineering risk.
- Every password reset and remote session.
- Attacker impersonates CFO; tech follows callback procedure and blocks attempt.

---

### Track: Advanced

#### Chapter 14: PowerShell Automation for Helpdesk *(Level: Advanced)*

**Chapter focus: PowerShell Automation for Helpdesk** *(Level: Advanced)*

Automate onboarding: create AD user, assign groups, create mailbox, add license. Scheduled scripts check disk space, stale accounts, and expired passwords. Use approved script repository and logging.

Code Reference:
```powershell
$users = Import-Csv new_hires.csv
foreach ($u in $users) {
  New-ADUser -Name $u.Name -SamAccountName $u.Sam -Enabled $true
}
```
What it shows: Bulk user creation from HR feed reduces manual errors.

### What it actually is
PowerShell automation scales Tier 1 repetitive tasks.

### When to use it
Onboarding batches, health checks, and reporting.

### Where to use it
Microsoft-centric enterprises.

### Real use example
Monday onboarding script creates 15 users in 3 minutes vs 2 hours manual work.

**Key takeaways**
- PowerShell automation scales Tier 1 repetitive tasks.
- Onboarding batches, health checks, and reporting.
- Monday onboarding script creates 15 users in 3 minutes vs 2 hours manual work.

#### Chapter 15: Enterprise Monitoring and Asset Management *(Level: Advanced)*

**Chapter focus: Enterprise Monitoring and Asset Management** *(Level: Advanced)*

Tools like SCCM/Intune, Lansweeper, or Snipe-IT track hardware lifecycle, warranty, and patch compliance. Integrate alerts with ticketing for proactive fixes before users call.

Code Reference:
```powershell
# Intune compliance policy: BitLocker ON, OS patch < 30 days, AV active
```
What it shows: Compliance policies define healthy endpoint baseline.

### What it actually is
Monitoring shifts support from reactive to proactive.

### When to use it
Large fleets (1000+ endpoints).

### Where to use it
Enterprise desktop and mobile management.

### Real use example
Disk space alert opens ticket before user crashes during exam submission.

**Key takeaways**
- Monitoring shifts support from reactive to proactive.
- Large fleets (1000+ endpoints).
- Disk space alert opens ticket before user crashes during exam submission.

#### Chapter 16: Disaster Recovery and Backup Verification *(Level: Advanced)*

**Chapter focus: Disaster Recovery and Backup Verification** *(Level: Advanced)*

Support participates in DR tests: verify backup restore, document RTO/RPO, and run tabletop exercises. Know offsite backup location and escalation during ransomware events.

Code Reference:
```powershell
Restore-ADObject -Identity $guid -Server DC1
# Test file restore from Veeam backup job
```
What it shows: Periodic restore tests prove backups are not vanity metrics.

### What it actually is
DR verification ensures recoverability after catastrophic failure.

### When to use it
Quarterly DR drills and post-incident recovery.

### Where to use it
Datacenters, schools, and healthcare IT.

### Real use example
Ransomware hits file server; team restores from immutable backup within 4-hour RTO.

**Key takeaways**
- DR verification ensures recoverability after catastrophic failure.
- Quarterly DR drills and post-incident recovery.
- Ransomware hits file server; team restores from immutable backup within 4-hour RTO.

#### Chapter 17: Tier 3 Escalation and Root Cause Analysis *(Level: Advanced)*

**Chapter focus: Tier 3 Escalation and Root Cause Analysis** *(Level: Advanced)*

Tier 3 uses deep logs, perfmon, Process Monitor, and vendor support cases. Apply 5 Whys and fishbone diagrams. Produce RCA documents with corrective and preventive actions.

Code Reference:
```text
Why 1: App slow -> DB timeout
Why 2: Pool exhausted -> ...
Why 5: Missing index on query
```
What it shows: 5 Whys trace symptoms to systemic cause.

### What it actually is
RCA prevents repeat incidents and informs problem management.

### When to use it
Major incidents and recurring escalations.

### Where to use it
Engineering and operations bridge roles.

### Real use example
Monthly login spike traced to cron job hammering auth service; schedule adjusted.

**Key takeaways**
- RCA prevents repeat incidents and informs problem management.
- Major incidents and recurring escalations.
- Monthly login spike traced to cron job hammering auth service; schedule adjusted.

#### Chapter 18: Knowledge Base Engineering *(Level: Advanced)*

**Chapter focus: Knowledge Base Engineering** *(Level: Advanced)*

Transform ticket resolutions into searchable KB articles with symptoms, environment, steps, and verification. Measure deflection rate and article usefulness scores. Maintain ownership and review cadence.

Code Reference:
```text
KB Template: Title | Symptoms | Environment | Resolution Steps | Related Articles
```
What it shows: Standard template ensures findability and consistency.

### What it actually is
KB engineering reduces ticket volume through self-service.

### When to use it
Mature service desks with self-service portals.

### Where to use it
ServiceNow Knowledge, Confluence, SharePoint.

### Real use example
Password reset KB deflects 40% of Tier 1 tickets after portal promotion.

**Key takeaways**
- KB engineering reduces ticket volume through self-service.
- Mature service desks with self-service portals.
- Password reset KB deflects 40% of Tier 1 tickets after portal promotion.

---

*Family: IT Support / Helpdesk | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://learn.microsoft.com/windows/
- https://learn.microsoft.com/microsoft-365/
- https://learn.microsoft.com/training/paths/az-900-describe-cloud-concepts/
- https://www.comptia.org/certifications/a
- https://ubuntu.com/tutorials/command-line-for-beginners
- https://www.axelos.com/certifications/itil-service-management/itil-4-foundation