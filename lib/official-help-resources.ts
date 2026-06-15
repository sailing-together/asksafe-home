export interface OfficialHelpResource {
  id: string
  name: string
  description: string
  phone?: string
  phoneLabel?: string
  phoneLabelExtra?: string
  url?: string
  urlLabel?: string
  urgent?: boolean
}

export const officialHelpResources: OfficialHelpResource[] = [
  {
    id: "emergency",
    name: "Emergency",
    description: "Call 000 for immediate danger.",
    phone: "000",
    phoneLabel: "Call 000",
    urgent: true,
  },
  {
    id: "idcare",
    name: "IDCARE",
    description:
      "Australia's national identity and cyber support service. Contact them about identity or account compromise.",
    phone: "1800595160",
    phoneLabel: "1800 595 160",
    url: "https://www.idcare.org",
    urlLabel: "idcare.org",
  },
  {
    id: "scamwatch",
    name: "Scamwatch",
    description:
      "The government's anti-scam service. Report scams and check the latest warnings.",
    url: "https://www.scamwatch.gov.au",
    urlLabel: "scamwatch.gov.au",
  },
  {
    id: "acsc",
    name: "Australian Cyber Security Centre",
    description: "Report cyber incidents, such as a hacked account or device.",
    phone: "1300292371",
    phoneLabel: "1300 CYBER1",
    phoneLabelExtra: "(1300 292 371)",
    url: "https://www.cyber.gov.au/report-and-recover/report",
    urlLabel: "ReportCyber",
  },
  {
    id: "police",
    name: "Police Assistance Line",
    description: "Report non-urgent crime or get advice from police.",
    phone: "131444",
    phoneLabel: "131 444",
  },
  {
    id: "opan",
    name: "Older Persons Advocacy Network",
    description: "Confidential support and advice for older Australians.",
    phone: "1800353374",
    phoneLabel: "1800 353 374",
  },
  {
    id: "lifeline",
    name: "Lifeline",
    description: "Someone to talk to, any time, if you're feeling distressed.",
    phone: "131114",
    phoneLabel: "13 11 14",
  },
]

export function getOfficialHelpResources(ids?: string[]) {
  if (!ids) return officialHelpResources

  return ids
    .map((id) => officialHelpResources.find((resource) => resource.id === id))
    .filter((resource): resource is OfficialHelpResource => Boolean(resource))
}

