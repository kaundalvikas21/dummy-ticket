"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Save,
  X,
  Upload,
  Globe,
  Link2,
  GripVertical,
  Facebook,
  Youtube,
  Instagram,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  SkeletonCard,
  SkeletonCardContent,
} from "@/components/ui/skeleton-card";

export function FooterManagement() {
  const { toast } = useToast();
  const [footerData, setFooterData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // State for pending logo removal
  const [logoToRemove, setLogoToRemove] = useState(null);
  const [pendingLogoRemoval, setPendingLogoRemoval] = useState(false);

  // Store original values for change detection
  const [originalData, setOriginalData] = useState({
    company_name: "",
    url: "",
    alt_text: "",
    description: "",
    address: "",
  });

  // Track original form data for change detection
  const [originalLinkData, setOriginalLinkData] = useState(null);
  const [originalContactData, setOriginalContactData] = useState(null);
  const [originalSocialData, setOriginalSocialData] = useState(null);

  // Change detection functions
  const hasLinkChanges = () => {
    if (!originalLinkData) return false;
    return (
      linkFormData.title !== originalLinkData.title ||
      linkFormData.url !== originalLinkData.url ||
      linkFormData.section !== originalLinkData.section
    );
  };

  const hasContactChanges = () => {
    if (!originalContactData) return false;
    return (
      contactFormData.title !== originalContactData.title ||
      contactFormData.content !== originalContactData.content ||
      contactFormData.icon_type !== originalContactData.icon_type ||
      contactFormData.country !== originalContactData.country ||
      contactFormData.link_type !== originalContactData.link_type
    );
  };

  const hasSocialChanges = () => {
    if (!originalSocialData) return false;
    return (
      socialFormData.name !== originalSocialData.name ||
      socialFormData.url !== originalSocialData.url ||
      socialFormData.icon_name !== originalSocialData.icon_name
    );
  };

  // Unified save state
  const [savingRow1, setSavingRow1] = useState(false);

  // Separate loading states for each section
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  // Dialog states
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingSection, setEditingSection] = useState("");

  // Form data states
  const [logoData, setLogoData] = useState({
    url: "",
    alt_text: "",
    company_name: "",
  });
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const [linkFormData, setLinkFormData] = useState({
    title: "",
    url: "",
    section: "",
    id: null, // Track record ID for editing
  });

  const [contactFormData, setContactFormData] = useState({
    title: "",
    content: "",
    icon_type: "Phone",
    country: "",
    link_type: "tel",
    id: null, // Track record ID for editing
  });

  // Reset contact form
  const resetContactForm = () => {
    const initialData = {
      title: "",
      content: "",
      icon_type: "Phone",
      country: "",
      link_type: "tel",
      id: null, // Reset ID when creating new record
    };
    setContactFormData(initialData);
    setOriginalContactData(initialData);
  };

  const [socialFormData, setSocialFormData] = useState({
    name: "",
    url: "",
    icon_name: "facebook",
    id: null, // Track record ID for editing
  });

  // Auto-update display text when phone/email or country changes
  const updateContactDisplayText = (formData) => {
    const { link_type, content, country } = formData;
    let displayText = "";

    if (link_type === "tel" && content) {
      if (country) {
        displayText = `${country}: ${content}`;
      } else {
        displayText = content;
      }
    } else if (link_type === "mailto" && content) {
      displayText = content;
    }

    return displayText;
  };

  // Fetch footer data
  const fetchFooterData = async () => {
    try {
      setLoading(true);
      // Add cache-busting timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/footer?t=${timestamp}`);
      if (!response.ok) throw new Error("Failed to fetch footer data");

      const data = await response.json();
      setFooterData(data);

      // Set form data and store original values
      if (data.logo) {
        const newLogoData = {
          url: data.logo.url || "",
          alt_text: data.logo.alt_text || "",
          company_name: data.logo.company_name || "",
        };
        setLogoData(newLogoData);
        setOriginalData((prev) => ({
          ...prev,
          ...newLogoData,
        }));
      }

      const newDescription = data.description || "";
      const newAddress = data.address || "";
      setDescription(newDescription);
      setAddress(newAddress);
      setOriginalData((prev) => ({
        ...prev,
        description: newDescription,
        address: newAddress,
      }));
    } catch (error) {
      console.error("Error fetching footer data:", error);
      toast({
        title: "Error",
        description: "Failed to load footer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  // Reset pending removal state if data is refreshed from server
  useEffect(() => {
    if (footerData.logo?.url && pendingLogoRemoval) {
      setLogoToRemove(null);
      setPendingLogoRemoval(false);
    }
  }, [footerData.logo?.url, pendingLogoRemoval]);

  // Check if any changes exist in Row 1
  const hasRow1Changes = () => {
    return (
      logoData.company_name !== originalData.company_name ||
      logoData.url !== originalData.url ||
      logoData.alt_text !== originalData.alt_text ||
      description !== originalData.description ||
      address !== originalData.address ||
      pendingLogoRemoval // Include pending logo removal in change detection
    );
  };

  // Function to delete old logo from storage
  const deleteOldLogo = async (logoUrl) => {
    if (!logoUrl) return;

    try {
      // Extract file path from Supabase storage URL
      // Supabase URLs are typically: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlMatch = logoUrl.match(
        /\/storage\/v1\/object\/public\/assets\/(.+)/
      );
      if (urlMatch && urlMatch[1]) {
        const filePath = encodeURIComponent(urlMatch[1]);

        // Use admin storage API to delete the file
        const response = await fetch(
          `/api/admin/storage/upload?path=${filePath}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          console.error("Error deleting old logo:", response.statusText);
          // Don't throw error here, just log it as cleanup is not critical
        }
      }
    } catch (error) {
      console.error("Error during old logo cleanup:", error);
      // Don't throw error here as cleanup is not critical
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Please upload PNG, JPG, SVG, or WebP.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingLogo(true);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to admin storage API
      const response = await fetch("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
        // No need to set Content-Type header for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Storage upload failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData.error || "Failed to upload logo");
      }

      const result = await response.json();
      console.log("Storage upload successful:", result);

      // Update logo data with the new URL (but don't save to database yet)
      const updatedLogoData = { ...logoData, url: result.url };
      setLogoData(updatedLogoData);
      setLogoFile(null);

      console.log("Logo uploaded to storage, ready for save button");

      toast({
        title: "Logo Uploaded",
        description:
          "Logo uploaded to storage. Click 'Save All Footer Information' to save to database.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save logo only function
  const saveLogoOnly = async () => {
    try {
      setSavingLogo(true);

      // Validate that company name is provided (mandatory field)
      if (!logoData.company_name?.trim()) {
        throw new Error(
          "Company name is required. Please enter a company name."
        );
      }

      const payload = {
        section: "logo",
        content: logoData.url || null, // Logo URL is now optional
        extra_data: {
          alt_text: logoData.alt_text || "",
          company_name: logoData.company_name.trim(), // Company name is mandatory
        },
      };

      // Use POST if no ID exists (create new), PUT if ID exists (update)
      const method = footerData.logo?.id ? "PUT" : "POST";
      if (footerData.logo?.id) {
        payload.id = footerData.logo.id;
      }

      const response = await fetch("/api/footer", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save logo");
      }

      const responseData = await response.json();

      // Only refresh the logo data, not entire footer
      const refreshResponse = await fetch("/api/footer");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFooterData((prev) => ({ ...prev, logo: data.logo }));
        setLogoData((prev) => ({
          ...prev,
          url: data.logo?.url || prev.url,
        }));
      }

      toast({ title: "Success", description: "Logo saved successfully" });
    } catch (error) {
      console.error("Save logo error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save logo",
        variant: "destructive",
      });
    } finally {
      setSavingLogo(false);
    }
  };

  const saveDescription = async () => {
    try {
      setSavingDescription(true);

      // Find existing description item
      const existingDescription =
        footerData.description && typeof footerData.description === "object"
          ? footerData.description
          : null;

      const payload = {
        section: "description",
        content: description,
      };

      const method = existingDescription?.id ? "PUT" : "POST";
      if (existingDescription?.id) {
        payload.id = existingDescription.id;
      }

      const response = await fetch("/api/footer", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save description");
      }

      await fetchFooterData();
      toast({
        title: "Success",
        description: "Description saved successfully",
      });
    } catch (error) {
      console.error("Save description error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save description",
        variant: "destructive",
      });
    } finally {
      setSavingDescription(false);
    }
  };

  const saveAddress = async () => {
    try {
      setSavingAddress(true);

      // Find existing address item
      const existingAddress =
        footerData.address && typeof footerData.address === "object"
          ? footerData.address
          : null;

      const payload = {
        section: "address",
        content: address,
      };

      const method = existingAddress?.id ? "PUT" : "POST";
      if (existingAddress?.id) {
        payload.id = existingAddress.id;
      }

      const response = await fetch("/api/footer", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save address");
      }

      await fetchFooterData();
      toast({ title: "Success", description: "Address saved successfully" });
    } catch (error) {
      console.error("Save address error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // Unified save function for Row 1 - New API Structure
  const saveRow1Data = async () => {
    try {
      setSavingRow1(true);

      // Validate company name (mandatory field)
      if (!logoData.company_name?.trim()) {
        throw new Error(
          "Company name is required. Please enter a company name."
        );
      }

      // Delete old logo from storage if:
      // 1. URL has changed (existing logic) OR
      // 2. Logo is marked for removal
      const shouldDeleteOldLogo =
        (originalData.url &&
          originalData.url !== logoData.url &&
          originalData.url.includes("/storage/v1/object/public/")) ||
        (pendingLogoRemoval &&
          logoToRemove &&
          logoToRemove.includes("/storage/v1/object/public/"));

      if (shouldDeleteOldLogo) {
        const logoToDelete = pendingLogoRemoval
          ? logoToRemove
          : originalData.url;
        console.log("Deleting logo during save:", logoToDelete);
        await deleteOldLogo(logoToDelete);
      }

      // Prepare primary info data
      const primaryInfoData = {
        company_name: logoData.company_name.trim(),
        logo_url: pendingLogoRemoval ? null : logoData.url || null, // Set to null if pending removal
        logo_alt_text: logoData.alt_text || "VisaFly Logo",
        description: description,
        address: address,
      };

      // Single API call to update primary info
      const response = await fetch("/api/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update_primary",
          section: "primary_info",
          data: primaryInfoData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save primary information"
        );
      }

      // Reset pending removal state
      setLogoToRemove(null);
      setPendingLogoRemoval(false);

      // Update original data to current values
      setOriginalData({
        company_name: logoData.company_name,
        url: logoData.url,
        alt_text: logoData.alt_text,
        description: description,
        address: address,
      });

      toast({
        title: "Success",
        description: pendingLogoRemoval
          ? "All footer information saved successfully. Logo has been removed."
          : "All footer information saved successfully",
      });
    } catch (error) {
      console.error("Save Row 1 error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save footer information",
        variant: "destructive",
      });
    } finally {
      setSavingRow1(false);
    }
  };

  const saveLink = async () => {
    try {
      setSavingLink(true);

      // Validation: Check if required fields are empty
      if (!linkFormData.title || !linkFormData.title.trim()) {
        toast({
          title: "Error",
          description: "Link title is required",
          variant: "destructive",
        });
        setSavingLink(false);
        return;
      }

      if (!linkFormData.url || !linkFormData.url.trim()) {
        toast({
          title: "Error",
          description: "Link URL is required",
          variant: "destructive",
        });
        setSavingLink(false);
        return;
      }

      if (linkFormData.id) {
        // Update existing link
        const response = await fetch("/api/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "update_array_item",
            section: "links",
            itemId: linkFormData.id,
            data: {
              linkType: linkFormData.section,
              updateData: {
                title: linkFormData.title,
                href: linkFormData.url,
              },
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to update link");
      } else {
        // Add new link
        const response = await fetch("/api/footer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "add_to_array",
            section: "links",
            data: {
              title: linkFormData.title,
              href: linkFormData.url,
              linkType: linkFormData.section, // 'company' or 'support'
              sort_order:
                footerData[`${linkFormData.section}_links`]?.length || 0,
              visible: true, // New items are visible by default
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to save link");
      }

      // Reset form and close dialog
      setLinkFormData({ title: "", url: "", section: "", id: null });
      setShowLinkDialog(false);
      await fetchFooterData();
      toast({
        title: "Success",
        description: linkFormData.id
          ? "Link updated successfully"
          : "Link saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save link",
        variant: "destructive",
      });
    } finally {
      setSavingLink(false);
    }
  };

  const saveContact = async () => {
    try {
      setSavingContact(true);

      const {
        title,
        content,
        icon_type,
        country,
        link_type,
        id
      } = contactFormData;

      // Validation: Check if required fields are empty
      if (!title || !title.trim()) {
        toast({
          title: "Error",
          description: "Contact title is required",
          variant: "destructive",
        });
        setSavingContact(false);
        return;
      }

      if (!content || !content.trim()) {
        toast({
          title: "Error",
          description: "Contact information (phone/email) is required",
          variant: "destructive",
        });
        setSavingContact(false);
        return;
      }

      if (!link_type) {
        toast({
          title: "Error",
          description: "Contact type is required",
          variant: "destructive",
        });
        setSavingContact(false);
        return;
      }

      if (id) {
        // Update existing contact
        const response = await fetch("/api/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "update_array_item",
            section: "contact",
            itemId: id,
            data: {
              updateData: {
                title,
                content,
                icon_type,
                country,
                link_type
              }
            }
          }),
        });

        if (!response.ok) throw new Error("Failed to update contact");
      } else {
        // Add new contact
        const response = await fetch("/api/footer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "add_to_array",
            section: "contact",
            data: {
              id: crypto.randomUUID(),
              title,
              content,
              icon_type,
              country,
              link_type,
              visible: true // New items are visible by default
            }
          }),
        });

        if (!response.ok) throw new Error("Failed to save contact");
      }

      resetContactForm();
      setShowContactDialog(false);
      await fetchFooterData();
      toast({
        title: "Success",
        description: contactFormData.id
          ? "Contact item updated successfully"
          : "Contact item saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact item",
        variant: "destructive",
      });
    } finally {
      setSavingContact(false);
    }
  };

  const saveSocial = async () => {
    try {
      setSavingSocial(true);

      const {
        name,
        url,
        icon_name,
        id
      } = socialFormData;

      // Validation: Check if required fields are empty
      if (!name || !name.trim()) {
        toast({
          title: "Error",
          description: "Social media name is required",
          variant: "destructive",
        });
        setSavingSocial(false);
        return;
      }

      if (!url || !url.trim()) {
        toast({
          title: "Error",
          description: "Social media URL is required",
          variant: "destructive",
        });
        setSavingSocial(false);
        return;
      }

      if (!icon_name) {
        toast({
          title: "Error",
          description: "Social media icon is required",
          variant: "destructive",
        });
        setSavingSocial(false);
        return;
      }

      if (id) {
        // Update existing social link
        const response = await fetch("/api/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "update_array_item",
            section: "social",
            itemId: id,
            data: {
              updateData: {
                name,
                url,
                icon_name
              }
            }
          }),
        });

        if (!response.ok) throw new Error("Failed to update social link");
      } else {
        // Add new social link
        const response = await fetch("/api/footer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include authentication cookies
          body: JSON.stringify({
            operation: "add_to_array",
            section: "social",
            data: {
              id: crypto.randomUUID(),
              name,
              url,
              icon_name,
              sort_order: footerData.social_links?.length || 0,
              visible: true // New items are visible by default
            }
          }),
        });

        if (!response.ok) throw new Error("Failed to save social link");
      }

      // Reset form and close dialog
      setSocialFormData({ name: "", url: "", icon_name: "facebook", id: null });
      setShowSocialDialog(false);
      await fetchFooterData();
      toast({
        title: "Success",
        description: socialFormData.id
          ? "Social link updated successfully"
          : "Social link saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save social link",
        variant: "destructive",
      });
    } finally {
      setSavingSocial(false);
    }
  };

  const deleteItem = async () => {
    if (!selectedItem) return;

    try {
      // Use a separate loading state for delete
      setSavingLogo(true);

      // Determine which section the item belongs to
      let section = "";
      if (
        selectedItem.href &&
        !selectedItem.link_type &&
        !selectedItem.icon_name
      ) {
        // It's a link item (company or support)
        section = "links";
      } else if (selectedItem.link_type) {
        // It's a contact item
        section = "contact";
      } else if (selectedItem.icon_name) {
        // It's a social item
        section = "social";
      }

      if (!section) {
        throw new Error("Unable to determine item section");
      }

      const response = await fetch(
        `/api/footer?section=${section}&itemId=${selectedItem.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete item");

      setShowDeleteDialog(false);
      setSelectedItem(null);
      await fetchFooterData();
      toast({ title: "Success", description: "Item deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setSavingLogo(false);
    }
  };

  // Toggle visibility of footer items by updating visible field
  const toggleItemVisibility = async (section, itemId, isVisible, linkType = null) => {
    try {
      const newVisibleState = !isVisible;

      // Update local state immediately for instant UI feedback
      const updatedFooterData = { ...footerData };

      if (section === 'links') {
        const linkTypeKey = linkType || 'company';
        const links = updatedFooterData[`${linkTypeKey}_links`];
        const linkIndex = links.findIndex(link => link.id === itemId);
        if (linkIndex !== -1) {
          links[linkIndex].visible = newVisibleState;
        }
      } else if (section === 'contact') {
        const contactIndex = updatedFooterData.contact_items.findIndex(item => item.id === itemId);
        if (contactIndex !== -1) {
          updatedFooterData.contact_items[contactIndex].visible = newVisibleState;
        }
      } else if (section === 'social') {
        const socialIndex = updatedFooterData.social_links.findIndex(social => social.id === itemId);
        if (socialIndex !== -1) {
          updatedFooterData.social_links[socialIndex].visible = newVisibleState;
        }
      }

      // Update state immediately for instant UI update
      setFooterData(updatedFooterData);

      // Then sync with database in background
      const requestBody = {
        operation: "update_array_item",
        section: section,
        itemId: itemId,
        data: {
          updateData: {
            visible: newVisibleState
          }
        }
      };

      // Add linkType for links section
      if (section === 'links' && linkType) {
        requestBody.data.linkType = linkType;
      }

      const response = await fetch("/api/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // If database update fails, revert the local state
        await fetchFooterData();
        throw new Error("Failed to update visibility");
      }

      toast({
        title: "Success",
        description: `Item ${newVisibleState ? 'shown' : 'hidden'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const getSocialIcon = (iconName) => {
    const icons = {
      facebook: Facebook,
      youtube: Youtube,
      instagram: Instagram,
    };
    return icons[iconName] || Globe;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Footer Management
          </h1>
          <p className="text-gray-600">Manage your website footer content</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Primary Footer Information Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 lg:p-8">
          <div className="space-y-8">
            {/* Two Column Grid Layout with Integrated Save Button */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Logo & Company */}
              <div className="space-y-6">
                <Card className="h-full border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Logo & Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={logoData.company_name}
                    onChange={(e) =>
                      setLogoData((prev) => ({
                        ...prev,
                        company_name: e.target.value,
                      }))
                    }
                    placeholder="Enter company name (required)"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <Label>Upload Logo (Optional)</Label>
                  <div className="mt-2">
                    {logoData.url || pendingLogoRemoval ? (
                      <div
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          pendingLogoRemoval
                            ? "bg-yellow-50 border-yellow-300"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {logoData.url ? (
                            <img
                              src={logoData.url}
                              alt="Current logo"
                              className="w-16 h-16 object-contain border rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 border rounded bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {pendingLogoRemoval
                                ? "Logo marked for removal"
                                : "Logo uploaded"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pendingLogoRemoval
                                ? "Click save to permanently remove from storage and database"
                                : "Click save to persist changes"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle logo removal (UI-only - mark for removal)
                            if (pendingLogoRemoval) {
                              // Cancel removal - restore the logo
                              setLogoData((prev) => ({
                                ...prev,
                                url: logoToRemove,
                              }));
                              setLogoToRemove(null);
                              setPendingLogoRemoval(false);
                              toast({
                                title: "Logo Removal Cancelled",
                                description: "Logo removal has been cancelled.",
                              });
                            } else {
                              // Mark logo for removal
                              setLogoToRemove(logoData.url);

                              // Clear logo from UI only (not from database yet)
                              setLogoData((prev) => ({ ...prev, url: "" }));

                              // Mark as pending removal to enable save button
                              setPendingLogoRemoval(true);

                              toast({
                                title: "Logo Marked for Removal",
                                description:
                                  "Logo will be permanently removed when you click 'Save All Footer Information'.",
                              });
                            }
                          }}
                        >
                          {pendingLogoRemoval ? "Cancel Removal" : "Remove"}
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Click to upload logo
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleLogoUpload(file);
                            }}
                            disabled={uploadingLogo}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, SVG, or WebP (max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={logoData.alt_text}
                    onChange={(e) =>
                      setLogoData((prev) => ({
                        ...prev,
                        alt_text: e.target.value,
                      }))
                    }
                    placeholder="Enter logo alt text for SEO"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

              {/* Right Column: Footer Description + Business Address stacked */}
              <div className="space-y-6">
                {/* Footer Description */}
                <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                <CardTitle>Footer Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter footer description"
                  rows={6}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

                {/* Business Address */}
                <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter business address"
                  rows={6}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
               
              </div>

              {/* Integrated Save Button - Spans both columns on desktop */}
              <div className="lg:col-span-2 flex justify-center pt-4">
            <Button
              onClick={saveRow1Data}
              disabled={
                savingRow1 ||
                uploadingLogo ||
                !hasRow1Changes() ||
                !logoData.company_name?.trim()
              }
              className="px-8 py-2 text-base font-medium w-full lg:w-auto lg:px-12"
              size="lg"
            >
              {savingRow1
                ? "Saving..."
                : uploadingLogo
                ? "Uploading..."
                : "Save All Footer Information"}
            </Button>
          </div>
        </div>
        </div>
        </div>

        {/* Secondary Footer Management - Links & Contact */}
        <div className="border-t border-gray-100 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Company Links + Support Links */}
          <div className="space-y-6">
            {/* Company Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Company Links</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setLinkFormData({
                        title: "",
                        url: "",
                        section: "company",
                        id: null,
                      });
                      setOriginalLinkData({
                        title: "",
                        url: "",
                        section: "company",
                        id: null,
                      });
                      setShowLinkDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {footerData.company_links?.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm text-gray-500">{link.href}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleItemVisibility("links", link.id, link.visible !== false, "company")}
                          className={link.visible === false ? "opacity-50" : ""}
                        >
                          {link.visible === false ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit company link
                            const editData = {
                              title: link.title || "",
                              url: link.href || "",
                              section: "company",
                              id: link.id,
                            };
                            setLinkFormData(editData);
                            setOriginalLinkData(editData);
                            setShowLinkDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(link);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Support Links</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setLinkFormData({
                        title: "",
                        url: "",
                        section: "support",
                        id: null,
                      });
                      setOriginalLinkData({
                        title: "",
                        url: "",
                        section: "support",
                        id: null,
                      });
                      setShowLinkDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {footerData.support_links?.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm text-gray-500">{link.href}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleItemVisibility("links", link.id, link.visible !== false, "support")}
                          className={link.visible === false ? "opacity-50" : ""}
                        >
                          {link.visible === false ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit support link
                            const editData = {
                              title: link.title || "",
                              url: link.href || "",
                              section: "support",
                              id: link.id,
                            };
                            setLinkFormData(editData);
                            setOriginalLinkData(editData);
                            setShowLinkDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(link);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Contact Information + Social Media */}
          <div className="space-y-6">
            {/* Contact Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetContactForm();
                      setShowContactDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {footerData.contact_items?.map((item) => {
                    const Icon = item.icon === "Mail" ? Mail : Phone;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{item.text}</div>
                            <div className="text-sm text-gray-500">
                              {item.href}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleItemVisibility("contact", item.id, item.visible !== false)}
                            className={item.visible === false ? "opacity-50" : ""}
                          >
                            {item.visible === false ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Extract the raw phone/email from href
                              const rawContent = item.href.replace(
                                /^(tel:|mailto:)/,
                                ""
                              );
                              const editData = {
                                title: item.text || "",
                                content: rawContent || "",
                                icon_type: item.icon || "Phone",
                                country: item.country || "",
                                link_type: item.link_type || "tel",
                                id: item.id, // Include record ID for editing
                              };
                              setContactFormData(editData);
                              setOriginalContactData(editData);
                              setShowContactDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      const initialSocialData = {
                        name: "",
                        url: "",
                        icon_name: "facebook",
                        id: null,
                      };
                      setSocialFormData(initialSocialData);
                      setOriginalSocialData(initialSocialData);
                      setShowSocialDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {footerData.social_links?.map((social) => {
                    const Icon = getSocialIcon(social.icon_name);
                    return (
                      <div
                        key={social.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{social.name}</div>
                            <div className="text-sm text-gray-500">
                              {social.href}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleItemVisibility("social", social.id, social.visible !== false)}
                            className={social.visible === false ? "opacity-50" : ""}
                          >
                            {social.visible === false ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const editData = {
                                name: social.name || "",
                                url: social.href || "",
                                icon_name: social.icon_name || "facebook",
                                id: social.id, // Include record ID for editing
                              };
                              setSocialFormData(editData);
                              setOriginalSocialData(editData);
                              setShowSocialDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(social);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkFormData.id ? "Edit" : "Add"}{" "}
              {linkFormData.section === "company" ? "Company" : "Support"} Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Link Title</Label>
              <Input
                value={linkFormData.title}
                onChange={(e) =>
                  setLinkFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter link title"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={linkFormData.url}
                onChange={(e) =>
                  setLinkFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="Enter URL"
              />
            </div>
            <Button onClick={saveLink} disabled={!hasLinkChanges() || savingLink} className="w-full">
              {savingLink ? "Saving..." : "Save Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {contactFormData.id ? "Edit" : "Add"} Contact Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                value={contactFormData.link_type}
                onValueChange={(value) => {
                  const newFormData = {
                    ...contactFormData,
                    link_type: value,
                    icon_type: value === "mailto" ? "Mail" : "Phone",
                    title: updateContactDisplayText({
                      ...contactFormData,
                      link_type: value,
                    }),
                  };
                  setContactFormData(newFormData);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="mailto">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {contactFormData.link_type === "tel" && (
              <div>
                <Label>Country (Optional)</Label>
                <Input
                  value={contactFormData.country}
                  onChange={(e) => {
                    const newFormData = {
                      ...contactFormData,
                      country: e.target.value,
                    };
                    setContactFormData({
                      ...newFormData,
                      title: updateContactDisplayText(newFormData),
                    });
                  }}
                  placeholder="e.g., USA, UK"
                />
              </div>
            )}
            <div>
              <Label>
                {contactFormData.link_type === "tel"
                  ? "Phone Number"
                  : "Email Address"}
              </Label>
              <Input
                value={contactFormData.content}
                onChange={(e) => {
                  const newFormData = {
                    ...contactFormData,
                    content: e.target.value,
                  };
                  setContactFormData({
                    ...newFormData,
                    title: updateContactDisplayText(newFormData),
                  });
                }}
                placeholder={
                  contactFormData.link_type === "tel"
                    ? "+1-800-123-4567"
                    : "info@visafly.com"
                }
              />
            </div>
            <div>
              <Label>Display Text (Auto-filled)</Label>
              <Input
                value={contactFormData.title}
                onChange={(e) =>
                  setContactFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="This will be auto-filled based on your input"
              />
              <p className="text-xs text-gray-500 mt-1">
                This text will be displayed in the footer. Auto-filled based on
                your country and phone/email above.
              </p>
            </div>
            <Button
              onClick={saveContact}
              disabled={!hasContactChanges() || savingContact}
              className="w-full"
            >
              {savingContact ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Dialog */}
      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {socialFormData.id ? "Edit" : "Add"} Social Media Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Platform Name</Label>
              <Input
                value={socialFormData.name}
                onChange={(e) =>
                  setSocialFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Facebook, Twitter"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={socialFormData.url}
                onChange={(e) =>
                  setSocialFormData((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Select
                value={socialFormData.icon_name}
                onValueChange={(value) =>
                  setSocialFormData((prev) => ({ ...prev, icon_name: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={saveSocial}
              disabled={!hasSocialChanges() || savingSocial}
              className="w-full"
            >
              {savingSocial ? "Saving..." : "Save Social Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteItem} disabled={savingLogo}>
              {savingLogo ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
