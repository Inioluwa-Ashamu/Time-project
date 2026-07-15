const configWarning = document.querySelector("#admin-config-warning");
const loginSection = document.querySelector("#admin-login-section");
const loginForm = document.querySelector("#admin-login-form");
const loginError = document.querySelector("#admin-login-error");
const loginSuccess = document.querySelector("#admin-login-success");
const forgotPasswordButton = document.querySelector("#admin-forgot-password");
const passwordSection = document.querySelector("#admin-password-section");
const passwordForm = document.querySelector("#admin-password-form");
const passwordTitle = document.querySelector("#admin-password-title");
const passwordIntro = document.querySelector("#admin-password-intro");
const passwordError = document.querySelector("#admin-password-error");
const passwordSuccess = document.querySelector("#admin-password-success");
const appSection = document.querySelector("#admin-app");
const sessionLabel = document.querySelector("#admin-session-label");
const signOutButton = document.querySelector("#admin-sign-out");

const teamForm = document.querySelector("#team-profile-form");
const teamList = document.querySelector("#team-profile-list");
const teamRefresh = document.querySelector("#team-refresh");
const teamReset = document.querySelector("#team-profile-reset");
const teamImagePreview = document.querySelector("#team-image-preview");
const teamFormError = document.querySelector("#team-form-error");

const resourceForm = document.querySelector("#staff-resource-form");
const resourceList = document.querySelector("#staff-resource-list");
const resourcesRefresh = document.querySelector("#resources-refresh");
const resourceReset = document.querySelector("#staff-resource-reset");
const resourceFormError = document.querySelector("#resource-form-error");

const hubPasswordForm = document.querySelector("#support-hub-password-form");
const hubPasswordRefresh = document.querySelector("#support-hub-password-refresh");
const hubPasswordStatus = document.querySelector("#support-hub-password-status");
const hubPasswordError = document.querySelector("#support-hub-password-error");

let supabaseClient = null;
let teamProfiles = [];
let staffResources = [];
let passwordSetupRequired = false;
let passwordSetupReason = "";

const supportHubPasswordSettingKey = "support_worker_password_hash";

const escapeHtml = (value) =>
    String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const showError = (element, message) => {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.hidden = false;
};

const clearError = (element) => {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.hidden = true;
};

const hashValue = async (value) => {
    const encodedValue = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", encodedValue);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

const showSuccess = (element, message) => {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.hidden = false;
};

const clearSuccess = (element) => {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.hidden = true;
};

const isSupabaseConfigured = () => {
    const config = window.tssSupabaseConfig || {};
    const apiKey = config.publishableKey || config.anonKey || "";
    return Boolean(
        window.supabase &&
        typeof window.supabase.createClient === "function" &&
        config.enabled !== false &&
        config.url &&
        apiKey &&
        !String(config.url).includes("YOUR-PROJECT-REF") &&
        !String(apiKey).includes("YOUR_PUBLIC_ANON_KEY") &&
        !String(apiKey).includes("YOUR_PUBLISHABLE_KEY")
    );
};

const getClient = () => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    if (!supabaseClient) {
        const config = window.tssSupabaseConfig;
        supabaseClient = window.supabase.createClient(config.url, config.publishableKey || config.anonKey);
    }

    return supabaseClient;
};

const getAuthLinkType = () => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return params.get("type") || hash.get("type") || "";
};

const isPasswordSetupType = (type) => ["recovery", "invite"].includes(String(type).toLowerCase());

const cleanAuthUrl = () => {
    const url = new URL(window.location.href);
    const authParams = [
        "access_token",
        "code",
        "expires_at",
        "expires_in",
        "refresh_token",
        "token_type",
        "type"
    ];

    authParams.forEach((param) => url.searchParams.delete(param));
    url.hash = "";
    window.history.replaceState({}, document.title, url.toString());
};

const showPasswordSetup = (reason) => {
    passwordSetupRequired = true;
    passwordSetupReason = reason || passwordSetupReason || "setup";
    appSection.hidden = true;
    loginSection.hidden = true;
    passwordSection.hidden = false;
    clearError(passwordError);
    clearSuccess(passwordSuccess);

    if (passwordSetupReason === "recovery") {
        passwordTitle.textContent = "Reset your password.";
        passwordIntro.textContent = "Enter a new password for your website admin account.";
    } else {
        passwordTitle.textContent = "Set your password.";
        passwordIntro.textContent = "Choose a password for your website admin account.";
    }
};

const getImageUrl = (profile) => {
    if (profile.image_url) {
        return profile.image_url;
    }

    if (!profile.image_path) {
        return "";
    }

    const bucket = window.tssSupabaseConfig.profileImageBucket || "profile-images";
    return getClient().storage.from(bucket).getPublicUrl(profile.image_path).data.publicUrl || "";
};

const checkAdminAccess = async () => {
    const client = getClient();
    const { data, error } = await client.from("admin_users").select("user_id").limit(1);

    if (error) {
        throw error;
    }

    return Array.isArray(data) && data.length > 0;
};

const setAuthedState = async (session) => {
    if (!session) {
        appSection.hidden = true;
        passwordSection.hidden = true;
        loginSection.hidden = false;
        return;
    }

    if (passwordSetupRequired) {
        showPasswordSetup(passwordSetupReason);
        return;
    }

    try {
        const hasAccess = await checkAdminAccess();

        if (!hasAccess) {
            await getClient().auth.signOut();
            showError(loginError, "This account is signed in but is not listed as a website admin.");
            appSection.hidden = true;
            passwordSection.hidden = true;
            loginSection.hidden = false;
            return;
        }

        clearError(loginError);
        clearSuccess(loginSuccess);
        passwordSection.hidden = true;
        loginSection.hidden = true;
        appSection.hidden = false;
        sessionLabel.textContent = session.user.email || "Admin dashboard";
        await Promise.all([loadTeamProfiles(), loadStaffResources(), loadAccessSettings()]);
    } catch (error) {
        showError(loginError, `Admin check failed: ${error.message}`);
        appSection.hidden = true;
        passwordSection.hidden = true;
        loginSection.hidden = false;
    }
};

const renderStatus = (published) =>
    published ? '<span class="admin-pill is-live">Published</span>' : '<span class="admin-pill">Draft</span>';

const loadTeamProfiles = async () => {
    const { data, error } = await getClient()
        .from("team_profiles")
        .select("*")
        .order("directory_group", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("display_name", { ascending: true });

    if (error) {
        showError(teamFormError, error.message);
        return;
    }

    teamProfiles = data || [];
    teamList.innerHTML = teamProfiles
        .map((profile) => `
            <tr>
                <td>
                    <strong>${escapeHtml(profile.display_name)}</strong>
                    <span>${escapeHtml(profile.role)}</span>
                </td>
                <td>${escapeHtml(profile.directory_group)}</td>
                <td>${renderStatus(profile.published)}</td>
                <td>${Number(profile.sort_order || 0)}</td>
                <td>
                    <div class="admin-row-actions">
                        <button type="button" class="text-link" data-edit-team="${profile.id}">Edit</button>
                        <button type="button" class="text-link danger-link" data-delete-team="${profile.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `)
        .join("");
};

const resetTeamForm = () => {
    teamForm.reset();
    document.querySelector("#team-profile-id").value = "";
    document.querySelector("#team-image-path").value = "";
    document.querySelector("#team-image-url").value = "";
    document.querySelector("#team-sort-order").value = "1000";
    document.querySelector("#team-public-profile").checked = true;
    document.querySelector("#team-published").checked = false;
    document.querySelector("#team-form-title").textContent = "New team profile";
    teamImagePreview.hidden = true;
    teamImagePreview.innerHTML = "";
    clearError(teamFormError);
};

const editTeamProfile = (profileId) => {
    const profile = teamProfiles.find((item) => item.id === profileId);

    if (!profile) {
        return;
    }

    document.querySelector("#team-profile-id").value = profile.id;
    document.querySelector("#team-display-name").value = profile.display_name || "";
    document.querySelector("#team-role").value = profile.role || "";
    document.querySelector("#team-directory-group").value = profile.directory_group || "support";
    document.querySelector("#team-bio").value = profile.bio || "";
    document.querySelector("#team-sort-order").value = profile.sort_order || 1000;
    document.querySelector("#team-image-path").value = profile.image_path || "";
    document.querySelector("#team-image-url").value = profile.image_url || "";
    document.querySelector("#team-public-profile").checked = Boolean(profile.public_profile);
    document.querySelector("#team-published").checked = Boolean(profile.published);
    document.querySelector("#team-form-title").textContent = `Edit ${profile.display_name}`;

    const imageUrl = getImageUrl(profile);
    if (imageUrl) {
        teamImagePreview.hidden = false;
        teamImagePreview.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(profile.display_name)}">`;
    } else {
        teamImagePreview.hidden = true;
        teamImagePreview.innerHTML = "";
    }

    teamForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

const uploadTeamImage = async (file) => {
    const client = getClient();
    const bucket = window.tssSupabaseConfig.profileImageBucket || "profile-images";
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
    const path = `team/${crypto.randomUUID()}-${safeName}`;
    const { error } = await client.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false
    });

    if (error) {
        throw error;
    }

    const publicUrl = client.storage.from(bucket).getPublicUrl(path).data.publicUrl || "";
    return { path, publicUrl };
};

const saveTeamProfile = async (event) => {
    event.preventDefault();
    clearError(teamFormError);

    try {
        let imagePath = document.querySelector("#team-image-path").value;
        let imageUrl = document.querySelector("#team-image-url").value;
        const imageFile = document.querySelector("#team-image-file").files[0];

        if (imageFile) {
            const uploadedImage = await uploadTeamImage(imageFile);
            imagePath = uploadedImage.path;
            imageUrl = uploadedImage.publicUrl;
        }

        const payload = {
            display_name: document.querySelector("#team-display-name").value.trim(),
            role: document.querySelector("#team-role").value.trim(),
            directory_group: document.querySelector("#team-directory-group").value,
            bio: document.querySelector("#team-bio").value.trim(),
            image_path: imagePath || null,
            image_url: imageUrl || null,
            public_profile: document.querySelector("#team-public-profile").checked,
            published: document.querySelector("#team-published").checked,
            sort_order: Number(document.querySelector("#team-sort-order").value || 1000)
        };
        const profileId = document.querySelector("#team-profile-id").value;
        const request = profileId
            ? getClient().from("team_profiles").update(payload).eq("id", profileId)
            : getClient().from("team_profiles").insert(payload);
        const { error } = await request;

        if (error) {
            throw error;
        }

        resetTeamForm();
        await loadTeamProfiles();
    } catch (error) {
        showError(teamFormError, error.message);
    }
};

const deleteTeamProfile = async (profileId) => {
    const profile = teamProfiles.find((item) => item.id === profileId);
    const label = profile ? profile.display_name : "this profile";

    if (!confirm(`Delete ${label}?`)) {
        return;
    }

    const { error } = await getClient().from("team_profiles").delete().eq("id", profileId);

    if (error) {
        showError(teamFormError, error.message);
        return;
    }

    await loadTeamProfiles();
};

const loadStaffResources = async () => {
    const { data, error } = await getClient()
        .from("staff_resources")
        .select("*")
        .order("section", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

    if (error) {
        showError(resourceFormError, error.message);
        return;
    }

    staffResources = data || [];
    resourceList.innerHTML = staffResources
        .map((resource) => `
            <tr>
                <td>
                    <strong>${escapeHtml(resource.title)}</strong>
                    <span>${escapeHtml(resource.link_label)}</span>
                </td>
                <td>${escapeHtml(resource.section)}</td>
                <td>${escapeHtml(resource.visibility)}</td>
                <td>${renderStatus(resource.published)}${resource.quick_action ? '<span class="admin-pill">Quick</span>' : ""}</td>
                <td>
                    <div class="admin-row-actions">
                        <button type="button" class="text-link" data-edit-resource="${resource.id}">Edit</button>
                        <button type="button" class="text-link danger-link" data-delete-resource="${resource.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `)
        .join("");
};

const resetResourceForm = () => {
    resourceForm.reset();
    document.querySelector("#staff-resource-id").value = "";
    document.querySelector("#resource-section").value = "General";
    document.querySelector("#resource-link-label").value = "Open resource";
    document.querySelector("#resource-sort-order").value = "1000";
    document.querySelector("#resource-published").checked = false;
    document.querySelector("#resource-quick-action").checked = false;
    document.querySelector("#resource-form-title").textContent = "New staff resource";
    clearError(resourceFormError);
};

const editStaffResource = (resourceId) => {
    const resource = staffResources.find((item) => item.id === resourceId);

    if (!resource) {
        return;
    }

    document.querySelector("#staff-resource-id").value = resource.id;
    document.querySelector("#resource-title").value = resource.title || "";
    document.querySelector("#resource-description").value = resource.description || "";
    document.querySelector("#resource-section").value = resource.section || "General";
    document.querySelector("#resource-link-label").value = resource.link_label || "Open resource";
    document.querySelector("#resource-url").value = resource.url || "";
    document.querySelector("#resource-type").value = resource.resource_type || "link";
    document.querySelector("#resource-visibility").value = resource.visibility || "staff";
    document.querySelector("#resource-sort-order").value = resource.sort_order || 1000;
    document.querySelector("#resource-published").checked = Boolean(resource.published);
    document.querySelector("#resource-quick-action").checked = Boolean(resource.quick_action);
    document.querySelector("#resource-form-title").textContent = `Edit ${resource.title}`;
    resourceForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

const saveStaffResource = async (event) => {
    event.preventDefault();
    clearError(resourceFormError);

    try {
        const payload = {
            title: document.querySelector("#resource-title").value.trim(),
            description: document.querySelector("#resource-description").value.trim(),
            section: document.querySelector("#resource-section").value.trim(),
            link_label: document.querySelector("#resource-link-label").value.trim(),
            url: document.querySelector("#resource-url").value.trim(),
            resource_type: document.querySelector("#resource-type").value,
            visibility: document.querySelector("#resource-visibility").value,
            quick_action: document.querySelector("#resource-quick-action").checked,
            published: document.querySelector("#resource-published").checked,
            sort_order: Number(document.querySelector("#resource-sort-order").value || 1000)
        };
        const resourceId = document.querySelector("#staff-resource-id").value;
        const request = resourceId
            ? getClient().from("staff_resources").update(payload).eq("id", resourceId)
            : getClient().from("staff_resources").insert(payload);
        const { error } = await request;

        if (error) {
            throw error;
        }

        resetResourceForm();
        await loadStaffResources();
    } catch (error) {
        showError(resourceFormError, error.message);
    }
};

const deleteStaffResource = async (resourceId) => {
    const resource = staffResources.find((item) => item.id === resourceId);
    const label = resource ? resource.title : "this resource";

    if (!confirm(`Delete ${label}?`)) {
        return;
    }

    const { error } = await getClient().from("staff_resources").delete().eq("id", resourceId);

    if (error) {
        showError(resourceFormError, error.message);
        return;
    }

    await loadStaffResources();
};

const formatSettingDate = (value) => {
    if (!value) {
        return "not recorded";
    }

    try {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
};

const loadAccessSettings = async () => {
    if (!hubPasswordStatus) {
        return;
    }

    clearError(hubPasswordError);

    const { data, error } = await getClient()
        .from("site_settings")
        .select("key, value, description, is_public, updated_at")
        .eq("key", supportHubPasswordSettingKey)
        .limit(1);

    if (error) {
        hubPasswordStatus.textContent = "Unable to load the current hub password setting.";
        showError(hubPasswordError, error.message);
        return;
    }

    const setting = Array.isArray(data) ? data[0] : null;

    if (!setting) {
        hubPasswordStatus.textContent = "No hub password setting exists yet. Save a new password to create it.";
        return;
    }

    const visibility = setting.is_public ? "readable by the public hub page" : "admin-only";
    const hashPreview = `${setting.value.slice(0, 8)}...${setting.value.slice(-8)}`;
    hubPasswordStatus.textContent = `Configured (${visibility}). Last updated ${formatSettingDate(setting.updated_at)}. Hash ${hashPreview}.`;
};

const saveHubPassword = async (event) => {
    event.preventDefault();
    clearError(hubPasswordError);

    const passwordInput = document.querySelector("#support-hub-password");
    const confirmInput = document.querySelector("#support-hub-password-confirm");
    const newPassword = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (newPassword.length < 12) {
        showError(hubPasswordError, "Use at least 12 characters for the hub password.");
        passwordInput.focus();
        return;
    }

    if (newPassword !== confirmPassword) {
        showError(hubPasswordError, "The two password fields do not match.");
        confirmInput.focus();
        return;
    }

    try {
        const passwordHash = await hashValue(newPassword);
        const { data } = await getClient().auth.getSession();
        const payload = {
            key: supportHubPasswordSettingKey,
            value: passwordHash,
            description: "SHA-256 hash used by support-workers.html for the Support Worker Hub unlock password.",
            is_public: true,
            updated_by: data.session?.user?.id || null
        };
        const { error } = await getClient()
            .from("site_settings")
            .upsert(payload, { onConflict: "key" });

        if (error) {
            throw error;
        }

        hubPasswordForm.reset();
        hubPasswordStatus.textContent = "Hub password saved. Share the new password through Time's approved staff channel.";
        await loadAccessSettings();
    } catch (error) {
        showError(hubPasswordError, error.message);
    }
};

const initTabs = () => {
    document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
        tab.addEventListener("click", () => {
            const activeTab = tab.dataset.adminTab;
            document.querySelectorAll("[data-admin-tab]").forEach((button) => {
                const isActive = button.dataset.adminTab === activeTab;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
            });
            document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
                panel.hidden = panel.dataset.adminPanel !== activeTab;
            });
        });
    });
};

const initAdmin = async () => {
    if (!isSupabaseConfigured()) {
        configWarning.hidden = false;
        loginSection.hidden = true;
        passwordSection.hidden = true;
        return;
    }

    const client = getClient();
    const authLinkType = getAuthLinkType();
    if (isPasswordSetupType(authLinkType)) {
        passwordSetupRequired = true;
        passwordSetupReason = authLinkType.toLowerCase();
    }

    const { data } = await client.auth.getSession();
    await setAuthedState(data.session);

    client.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
            showPasswordSetup("recovery");
            cleanAuthUrl();
            return;
        }

        if (event === "SIGNED_IN" && isPasswordSetupType(getAuthLinkType())) {
            showPasswordSetup(getAuthLinkType().toLowerCase());
            cleanAuthUrl();
            return;
        }

        setAuthedState(session);
    });
};

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(loginError);
    clearSuccess(loginSuccess);

    const email = document.querySelector("#admin-email").value.trim();
    const password = document.querySelector("#admin-password").value;
    const { error } = await getClient().auth.signInWithPassword({ email, password });

    if (error) {
        showError(loginError, error.message);
    }
});

forgotPasswordButton.addEventListener("click", async () => {
    clearError(loginError);
    clearSuccess(loginSuccess);

    const email = document.querySelector("#admin-email").value.trim();
    if (!email) {
        showError(loginError, "Enter your email address first, then request a reset link.");
        document.querySelector("#admin-email").focus();
        return;
    }

    const { error } = await getClient().auth.resetPasswordForEmail(email, {
        redirectTo: new URL("index.html", window.location.href).toString()
    });

    if (error) {
        showError(loginError, error.message);
        return;
    }

    showSuccess(loginSuccess, "Password reset email sent. Use the link in that email to set a new password.");
});

passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(passwordError);
    clearSuccess(passwordSuccess);

    const password = document.querySelector("#admin-new-password").value;
    const confirmPassword = document.querySelector("#admin-confirm-password").value;

    if (password.length < 8) {
        showError(passwordError, "Use at least 8 characters for the password.");
        return;
    }

    if (password !== confirmPassword) {
        showError(passwordError, "The passwords do not match.");
        return;
    }

    const { error } = await getClient().auth.updateUser({ password });

    if (error) {
        showError(passwordError, error.message);
        return;
    }

    passwordSetupRequired = false;
    passwordSetupReason = "";
    passwordForm.reset();
    cleanAuthUrl();
    showSuccess(passwordSuccess, "Password saved. Loading the admin dashboard...");

    const { data } = await getClient().auth.getSession();
    await setAuthedState(data.session);
});

signOutButton.addEventListener("click", () => {
    getClient().auth.signOut();
});

teamForm.addEventListener("submit", saveTeamProfile);
teamReset.addEventListener("click", resetTeamForm);
teamRefresh.addEventListener("click", loadTeamProfiles);
teamList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-team]");
    const deleteButton = event.target.closest("[data-delete-team]");

    if (editButton) {
        editTeamProfile(editButton.dataset.editTeam);
    }

    if (deleteButton) {
        deleteTeamProfile(deleteButton.dataset.deleteTeam);
    }
});

resourceForm.addEventListener("submit", saveStaffResource);
resourceReset.addEventListener("click", resetResourceForm);
resourcesRefresh.addEventListener("click", loadStaffResources);
resourceList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-resource]");
    const deleteButton = event.target.closest("[data-delete-resource]");

    if (editButton) {
        editStaffResource(editButton.dataset.editResource);
    }

    if (deleteButton) {
        deleteStaffResource(deleteButton.dataset.deleteResource);
    }
});

if (hubPasswordForm) {
    hubPasswordForm.addEventListener("submit", saveHubPassword);
}

if (hubPasswordRefresh) {
    hubPasswordRefresh.addEventListener("click", loadAccessSettings);
}

initTabs();
initAdmin();
