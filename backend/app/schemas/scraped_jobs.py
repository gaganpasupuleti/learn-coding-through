from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

FIXED_JOB_LOCATION = "India"

VALID_PROFILES = (
    "internship_india",
    "fresher_india",
    "entry_level_india",
    "experienced_manual_india",
    "platform_crm_india",
    "ai_india",
)


class NormalizedJob(BaseModel):
    id: str
    jobId: str | None = None
    source: str
    title: str
    company: str | None = None
    location: str | None = None
    jobType: str | None = None
    datePosted: datetime | None = None
    salaryMin: float | None = None
    salaryMax: float | None = None
    currency: str | None = None
    description: str | None = None
    jobUrl: str
    applyUrl: str | None = None
    createdAt: datetime | None = None
    createdAtIST: str | None = None
    linkStatus: str | None = "active"


class JobsListResponse(BaseModel):
    jobs: list[NormalizedJob]
    total: int
    page: int
    limit: int


class ScrapeRequest(BaseModel):
    searchTerm: str = "python developer"
    location: str = FIXED_JOB_LOCATION
    resultsWanted: int = Field(default=50, ge=1, le=50)
    hoursOld: int = Field(default=48, ge=1, le=168)
    sources: list[str] = Field(default_factory=lambda: ["indeed", "google", "linkedin"])

    @field_validator("location", mode="before")
    @classmethod
    def force_india_location(cls, value: str | None) -> str:
        return FIXED_JOB_LOCATION


class RefreshRequest(BaseModel):
    profile: str
    sources: list[str] = Field(default_factory=lambda: ["indeed", "google", "linkedin"])
    runMode: str = "manual"
    hoursOld: int | None = Field(default=None, ge=1, le=336)
    dateRangeDays: int | None = None

    @field_validator("profile")
    @classmethod
    def validate_profile(cls, value: str) -> str:
        if value not in VALID_PROFILES:
            raise ValueError(f"profile must be one of: {', '.join(VALID_PROFILES)}")
        return value

    @field_validator("dateRangeDays")
    @classmethod
    def validate_date_range_days(cls, value: int | None) -> int | None:
        if value is None:
            return None
        if value not in (1, 3, 7, 14):
            raise ValueError("dateRangeDays must be one of: 1, 3, 7, 14")
        return value

    @model_validator(mode="after")
    def validate_range_inputs(self):
        if self.hoursOld is not None and self.dateRangeDays is not None:
            raise ValueError("Provide either hoursOld or dateRangeDays, not both")
        return self


class RefreshResponse(BaseModel):
    profile: str
    profileLabel: str
    location: str = FIXED_JOB_LOCATION
    runType: str
    hoursOld: int
    dateRangeDays: int | None = None
    rangeLabel: str | None = None
    totalFound: int
    savedCount: int
    skippedDuplicates: int
    sourceBreakdown: dict[str, int]
    errors: list[str]
    scrapeRunId: int | None = None
    status: str | None = None
    durationMs: int | None = None
    totalJobsBefore: int | None = None
    totalJobsAfter: int | None = None
    expiredCount: int = 0
    failedLinkCount: int = 0


class CleanupLinksResponse(BaseModel):
    checkedCount: int
    markedActive: int
    markedExpired: int
    markedLinkFailed: int
    markedUnknown: int
    totalActive: int
    totalExpired: int
    totalLinkFailed: int
    totalUnknown: int
    deletedJobs: int = 0
    deletedEnrichments: int = 0
    scrapeRunId: int | None = None


class ScrapeSummary(BaseModel):
    searchTerm: str
    location: str = FIXED_JOB_LOCATION
    totalFound: int
    savedCount: int
    skippedDuplicates: int
    sourceBreakdown: dict[str, int]
    errors: list[str]
    jobs: list[NormalizedJob] = Field(default_factory=list)
    scrapeRunId: int | None = None
    status: str | None = None
    durationMs: int | None = None
    totalJobsBefore: int | None = None
    totalJobsAfter: int | None = None


class SourceBreakdownItem(BaseModel):
    source: str
    count: int


class LocationBreakdownItem(BaseModel):
    location: str
    count: int


class ScrapeRunSummary(BaseModel):
    id: int
    searchTerm: str
    location: str
    sources: list[str]
    totalFound: int
    savedCount: int
    skippedDuplicates: int
    errorCount: int
    status: str
    startedAt: datetime
    finishedAt: datetime | None
    durationMs: int | None
    runType: str = "manual"
    profile: str | None = None
    sourceBreakdown: dict[str, int] = Field(default_factory=dict)
    expiredCount: int = 0
    failedLinkCount: int = 0
    hoursOld: int | None = None


class LatestJobSummary(BaseModel):
    id: str
    jobId: str | None = None
    ingestProfile: str | None = None
    actualRoleId: str | None = None
    actualRoleName: str | None = None
    source: str
    title: str
    company: str | None
    location: str | None
    datePosted: datetime | None
    createdAt: datetime
    createdAtIST: str | None = None
    jobUrl: str
    linkStatus: str | None = "active"


class ProfileBreakdownItem(BaseModel):
    profile: str
    label: str
    count: int
    autoEnabled: bool = False


class EnrichmentRoleCountItem(BaseModel):
    roleId: str
    roleName: str
    count: int


class JobStatsResponse(BaseModel):
    totalJobs: int
    activeJobs: int
    loadedToday: int
    loadedLast24Hours: int
    loadedLast7Days: int
    latestLoadedAt: datetime | None
    expiredJobs: int
    linkFailedJobs: int
    unknownLinkJobs: int
    lastAutoRefreshAt: datetime | None
    lastCleanupAt: datetime | None
    sourceBreakdown: list[SourceBreakdownItem]
    sourceFailureCounts: dict[str, int]
    locationBreakdown: list[LocationBreakdownItem]
    recentScrapeRuns: list[ScrapeRunSummary]
    latestJobs: list[LatestJobSummary]
    expiredJobSamples: list[LatestJobSummary]
    profileBreakdown: list[ProfileBreakdownItem] = Field(default_factory=list)
    enrichmentRoleSummary: list[EnrichmentRoleCountItem] = Field(default_factory=list)


class JobBoardOverviewResponse(BaseModel):
    """Student-safe job board KPIs (no admin scrape audit fields)."""

    totalJobs: int
    activeJobs: int
    loadedToday: int
    loadedLast24Hours: int
    loadedLast7Days: int
    latestLoadedAt: datetime | None
    lastAutoRefreshAt: datetime | None
    profileBreakdown: list[ProfileBreakdownItem] = Field(default_factory=list)
    sourceBreakdown: list[SourceBreakdownItem] = Field(default_factory=list)
    enrichmentRoleSummary: list[EnrichmentRoleCountItem] = Field(default_factory=list)


class DigestSummary(BaseModel):
    totalActiveJobs: int
    selectedJobsCount: int
    recentJobsCount: int
    internships24h: int = 0
    freshers24h: int = 0
    topRoles: list[str] = Field(default_factory=list)
    topCompanies: list[str] = Field(default_factory=list)
    topLocations: list[str] = Field(default_factory=list)
    sourceSplit: dict[str, int] = Field(default_factory=dict)


class EmailDigestFields(BaseModel):
    jobIds: list[str] = Field(default_factory=list)
    searchTerm: str = "python developer"
    location: str = FIXED_JOB_LOCATION
    subjectOverride: str | None = None
    introMessage: str | None = None
    maxJobs: int = Field(default=20, ge=1, le=50)
    ctaLabel: str | None = None
    ctaUrl: str | None = None

    @field_validator("location", mode="before")
    @classmethod
    def force_india_location(cls, value: str | None) -> str:
        return FIXED_JOB_LOCATION


class EmailPreviewRequest(EmailDigestFields):
    pass


class EmailPreviewResponse(BaseModel):
    subject: str
    html: str
    text: str
    jobCount: int
    summary: DigestSummary


class SendDigestRequest(EmailDigestFields):
    mode: str = "test"
    testEmail: str | None = None
    recipientEmails: list[str] | None = None


class SendDigestResponse(BaseModel):
    sentCount: int
    failedCount: int
    failedEmails: list[str]
    mode: str
    message: str
    recipientCount: int | None = None
    jobCount: int | None = None
