import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateSubmissionRef } from "@/lib/client-forms/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      businessName,
      businessCategory,
      businessTagline,
      targetLocations,
      servicesProducts,
      websiteType,
      referenceWebsites,
      specialNotes,
      clientName,
      whatsappNumber,
      callingNumber,
      email,
      businessAddress,
      googleMapLink,
      workingHours,
      socialLinks,
      logoStatus,
      logoFileName,
      hasExistingLogo,
      selectedPackage,
      selectedAddons,
      totalEstimate,
      accountId,
    } = body;

    if (!businessName || !clientName || !whatsappNumber) {
      return NextResponse.json(
        { error: "Business name, client name, and WhatsApp number are required." },
        { status: 400 }
      );
    }

    const referenceNumber = body.referenceNumber || generateSubmissionRef();
    const id = body.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`);

    const newSubmission = {
      id,
      referenceNumber,
      status: "new",
      businessName,
      businessCategory: businessCategory || "Other",
      businessTagline: businessTagline || "",
      targetLocations: targetLocations || "UAE",
      servicesProducts: servicesProducts || "",
      websiteType: websiteType || "E-Commerce / Online Store",
      referenceWebsites: referenceWebsites || "",
      specialNotes: specialNotes || "",
      clientName,
      whatsappNumber,
      callingNumber: callingNumber || whatsappNumber,
      email: email || "",
      businessAddress: businessAddress || "",
      googleMapLink: googleMapLink || "",
      workingHours: workingHours || "",
      socialLinks: socialLinks || {},
      logoStatus: logoStatus || "upload",
      logoFileName: logoFileName || "",
      hasExistingLogo: hasExistingLogo !== false,
      selectedPackage: selectedPackage || {
        id: "standard",
        title: "3 Websites Designs - 1 Revision",
        price: 399,
        revisions: "1 Revision",
      },
      selectedAddons: selectedAddons || [],
      totalEstimate: Number(totalEstimate) || 399,
      internalNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt to persist to Supabase if configured
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll: () => request.cookies.getAll(),
              setAll: () => {},
            },
          }
        );

        const { error: dbError } = await supabase.from("client_form_submissions").insert({
          id,
          reference_number: referenceNumber,
          account_id: accountId || null,
          business_name: businessName,
          business_category: businessCategory,
          business_tagline: businessTagline,
          target_locations: targetLocations,
          services_products: servicesProducts,
          website_type: websiteType,
          reference_websites: referenceWebsites,
          special_notes: specialNotes,
          client_name: clientName,
          whatsapp_number: whatsappNumber,
          calling_number: callingNumber,
          email: email,
          business_address: businessAddress,
          google_map_link: googleMapLink,
          working_hours: workingHours,
          social_links: socialLinks,
          logo_status: logoStatus,
          logo_file_name: logoFileName,
          has_existing_logo: hasExistingLogo,
          selected_package: selectedPackage,
          selected_addons: selectedAddons,
          total_estimate: totalEstimate,
          status: "new",
        });

        if (dbError) {
          console.warn("Supabase insert warning (client form submission):", dbError.message);
        }
      }
    } catch (e) {
      console.warn("Database storage skipped or unavailable, using client sync:", e);
    }

    return NextResponse.json({
      success: true,
      submission: newSubmission,
    });
  } catch (error: any) {
    console.error("Error submitting client form:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process form submission." },
      { status: 500 }
    );
  }
}

