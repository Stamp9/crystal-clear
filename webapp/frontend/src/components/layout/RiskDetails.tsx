import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { JsonData } from "../../types";
import InfoCard from "@/components/common/InfoCard";
import {
    getRiskAnalysis,
    getProxyInfo,
    getPermissionInfo,
    getVerificationInfo,
    getAuditInfo,
} from "../../utils/queries";
import { API } from "@/constants";


interface RiskDetailsProps {
    jsonData: JsonData | null;
}

interface RiskMetric {
    name: string;
    value: string;
    level: "high" | "medium" | "low";
    note?: string;
    detail?: string;
}

export default function RiskDetails({ jsonData }: RiskDetailsProps) {
    const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);

    const defaultMetrics: RiskMetric[] = [
        { name: "Immutability", value: "waiting", level: "medium" },
        { name: "Admin Privileges", value: "waiting", level: "medium" },
        { name: "Verification", value: "waiting", level: "medium" },
        { name: "Audit", value: "waiting", level: "medium" },
    ];

    // Cache risk analysis data using TanStack Query
    const { data: proxyData, error: proxyError, isLoading: proxyLoading } = useQuery({
        queryKey: ['proxyInfo', jsonData?.address],
        queryFn: () => getProxyInfo(jsonData!.address, true),
        enabled: !!jsonData?.address,
        staleTime: API.STALE_TIME_MS,
        gcTime: API.STALE_TIME_MS * 2, // Keep cache for 20 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 500 errors, only on network failures
            if (error?.status === 500) return false;
            return failureCount < API.RETRY_ATTEMPTS;
        },
    });

    const { data: permissionData, error: permissionError, isLoading: permissionLoading } = useQuery({
        queryKey: ['permissionInfo', jsonData?.address],
        queryFn: () => getPermissionInfo(jsonData!.address, true),
        enabled: !!jsonData?.address,
        staleTime: API.STALE_TIME_MS,
        gcTime: API.STALE_TIME_MS * 2, // Keep cache for 20 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 500 errors, only on network failures
            if (error?.status === 500) return false;
            return failureCount < API.RETRY_ATTEMPTS;
        },
    });

    const { data: verificationData, error: verificationError, isLoading: verificationLoading } = useQuery({
        queryKey: ['verificationInfo', jsonData?.address],
        queryFn: () => getVerificationInfo(jsonData!.address, true),
        enabled: !!jsonData?.address,
        staleTime: API.STALE_TIME_MS,
        gcTime: API.STALE_TIME_MS * 2, // Keep cache for 20 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 500 errors, only on network failures
            if (error?.status === 500) return false;
            return failureCount < API.RETRY_ATTEMPTS;
        },
    });

    const { data: auditData, error: auditError, isLoading: auditLoading } = useQuery({
        queryKey: ['auditInfo', jsonData?.address],
        queryFn: () => getAuditInfo(jsonData!.address, true),
        enabled: !!jsonData?.address,
        staleTime: API.STALE_TIME_MS,
        gcTime: API.STALE_TIME_MS * 2, // Keep cache for 20 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 500 errors, only on network failures
            if (error?.status === 500) return false;
            return failureCount < API.RETRY_ATTEMPTS;
        },
    });

    useEffect(() => {
        if (jsonData?.address && jsonData.address !== currentAddress) {
            setCurrentAddress(jsonData.address);
            // Only set default metrics if we don't have cached data
            const hasAnyData = proxyData || permissionData || verificationData || auditData;
            if (!hasAnyData) {
                setRiskMetrics(defaultMetrics);
            }
        }
    }, [jsonData?.address, proxyData, permissionData, verificationData, auditData]);

    useEffect(() => {
        if (jsonData?.address) {
            // Check if all queries have finished (either with data or error)
            const allQueriesFinished = (
                (!proxyLoading && (proxyData !== undefined || proxyError)) &&
                (!permissionLoading && (permissionData !== undefined || permissionError)) &&
                (!verificationLoading && (verificationData !== undefined || verificationError)) &&
                (!auditLoading && (auditData !== undefined || auditError))
            );

            if (allQueriesFinished) {
                updateRiskMetrics();
            }
        }
    }, [jsonData?.address, proxyData, permissionData, verificationData, auditData,
        proxyError, permissionError, verificationError, auditError,
        proxyLoading, permissionLoading, verificationLoading, auditLoading]);

    const updateRiskMetrics = () => {
        const updated: RiskMetric[] = [...riskMetrics];

        // Proxy (Immutability)
        if (updated[0]) {
            const isProxy = proxyData && proxyData.type?.toLowerCase() !== "not a proxy";
            const level = proxyError ? "medium" : (isProxy ? "high" : "low");
            const proxyRiskMetric: RiskMetric = {
                name: `${updated[0].name}`,
                value: proxyError ? "Error" : (isProxy ? "Proxy" : "Immutable"),
                level: level,
            };
            if (updated[0].note) proxyRiskMetric.note = updated[0].note;
            if (proxyError) {
                proxyRiskMetric.detail = "Failed to fetch proxy information";
            } else if (proxyData) {
                proxyRiskMetric.detail = `Proxy Type: ${proxyData.type || "N/A"}\nProxy message: ${proxyData.message || "No additional message."}`;
            } else if (updated[0].detail) {
                proxyRiskMetric.detail = updated[0].detail;
            }
            updated[0] = proxyRiskMetric;
        }

        // Permission
        if (updated[1]) {
            const level = permissionError ? "medium" : (permissionData ? "high" : "low");
            const permissionRiskMetric: RiskMetric = {
                name: `${updated[1].name}`,
                value: permissionError ? "Error" : (permissionData ? `${permissionData.function?.length || 0} functions` : "N/A"),
                level: level,
            };
            if (updated[1].note) permissionRiskMetric.note = updated[1].note;
            if (permissionError) {
                permissionRiskMetric.detail = "Failed to fetch permission information";
            } else if (updated[1].detail) {
                permissionRiskMetric.detail = updated[1].detail;
            }
            updated[1] = permissionRiskMetric;
        }

        // Verification
        if (updated[2]) {
            const verified = verificationData !== null;
            const level = verificationError ? "medium" : (verified ? "low" : "high");
            const verificationRiskMetric: RiskMetric = {
                name: `${updated[2].name}`,
                value: verificationError ? "Error" : (verified ? "Verified" : "Not Verified"),
                level: level,
            };
            if (updated[2].note) verificationRiskMetric.note = updated[2].note;
            if (verificationError) {
                verificationRiskMetric.detail = "Failed to fetch verification information";
            } else if (verificationData) {
                verificationRiskMetric.detail =
                    (verificationData.verification ? `Verification status: ${verificationData.verification}\n` : "") +
                    (verificationData.verifiedAt ? `Verified at: ${verificationData.verifiedAt}` : "No verification time found.");
            } else {
                verificationRiskMetric.detail = "This contract is not verified on Sourcify.";
            }
            updated[2] = verificationRiskMetric;
        }

        // Audit
        if (updated[3]) {
            const audits = Array.isArray(auditData) ? auditData : [];
            const hasAudits = audits.length > 0;
            const level = auditError ? "medium" : (hasAudits ? "low" : "medium");
            const auditRiskMetric: RiskMetric = {
                name: `${updated[3].name}`,
                value: auditError ? "Error" : (hasAudits ? "Audited" : "Not Audited"),
                level: level,
            };
            if (updated[3].note) auditRiskMetric.note = updated[3].note;
            if (auditError) {
                auditRiskMetric.detail = "Failed to fetch audit information";
            } else if (hasAudits) {
                const protocol = audits[0]?.protocol || "Unknown";
                const version = audits[0]?.version || "Unknown";
                const auditDetails = audits.map((a, i) => {
                    return `🔹 Audit ${i + 1} by ${a.company}${a.url ? `\n ` : ""}`;
                }).join("");
                auditRiskMetric.detail = `Protocol: ${protocol}\nVersion: ${version}\n\n${auditDetails}`;
            } else {
                auditRiskMetric.detail = "No audit found for this contract.";
            }
            updated[3] = auditRiskMetric;
        }

        setRiskMetrics(updated);
    };





    // Determine if we should show loading state - only if we have no data and are loading
    const hasAnyData = proxyData || permissionData || verificationData || auditData;
    const hasProcessedData = riskMetrics.length > 0 && riskMetrics.some(m => m.value !== "waiting");
    const isLoading = jsonData?.address && (proxyLoading || permissionLoading || verificationLoading || auditLoading) && !hasAnyData && !hasProcessedData;

    return (
        <div className="w-full min-h-full h-fit bg-white">

            {isLoading ? (
                <div className="mt-10 flex justify-center items-center">
                    <div className="mt-50 animate-pulse px-4 py-2 bg-red-100 border border-gray-200 rounded-md shadow-sm text-sm text-gray-500 italic" style={{ marginTop: "100px", padding: "10px" }}>
                        🔍 Fetching Risk Details...
                    </div>
                </div>
            ) : (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: "16px",
                    gap: "10px",

                }}>
                    {riskMetrics.map((metric, index) => (
                        <InfoCard className="w-full"
                            key={index}
                            header={
                                <div className="w-full max-w-none" style={{
                                    borderBottom: "1px solid #497D74",
                                    paddingBottom: "4px",
                                    display: "flex",
                                    // justifyContent: "space-between",
                                    alignItems: "center",

                                }}>
                                    <span className="text-l font-medium text-gray-800 !mr-2" style={{ fontSize: "16px" }}>{metric.name}</span>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        {/* Risk Level Badge */}
                                        <span style={{
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            padding: "3px 8px",
                                            borderRadius: "6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}
                                            className={`${metric.level === "high"
                                                ? "bg-red-500 text-white"
                                                : metric.level === "medium"
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-green-500 text-white"}
                                            `}
                                        >
                                            {metric.level} risk
                                        </span>
                                        {/* Value Badge */}
                                        <span style={{
                                            fontSize: "12px",
                                            padding: "3px 8px",
                                            borderRadius: "6px",
                                        }}
                                            className={`text-xs font-medium
                                            ${metric.level === "high"
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : metric.level === "medium"
                                                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                                                        : "bg-green-50 text-green-700 border border-green-200"}
                                            `}
                                        >
                                            {metric.value}
                                        </span>
                                    </div>

                                </div>
                            }
                            content={
                                <div className="text-gray-600 whitespace-pre-line break-words whitespace-pre-wrap" style={{ fontSize: "14px" }}>
                                    {metric.detail || <span className="italic text-gray-400">No further details available.</span>}
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
