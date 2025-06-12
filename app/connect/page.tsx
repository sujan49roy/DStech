"use client";

import Head from "next/head";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Search, UserPlus, CheckCircle, Clock, UserCheck, AlertTriangle, Users, Loader2, Inbox, UserX, UserMinus, Link2 } from "lucide-react"; // Added UserMinus, Link2
import { toast } from "sonner";

// Define the structure of a user in search results
interface SearchUser {
  id: string; // maps to _id
  username: string;
  ghUsername?: string;
  relationshipStatus: "none" | "request_sent" | "request_received" | "friends";
}

// Define the structure for incoming request user
interface IncomingRequestUser {
  id: string; // maps to _id
  username: string;
  name?: string;
  ghUsername?: string;
  email?: string;
}

// Define the structure for a friend in the friends list
interface FriendUser {
  id: string; // maps to _id
  username: string; // Assuming username is the primary identifier
  name?: string; // Optional display name
  ghUsername?: string;
  email?: string; // Optional email for contact
}


export default function ConnectPage() {
  const pageTitle = "Connect with Friends - DStech";
  const pageDescription = "Find and connect with other DStech users. Expand your network and collaborate.";
  const canonicalUrl = "https://dstech.example.com/connect";
  const ogImageUrl = "https://dstech.example.com/placeholder-og-connect-image.jpg";
  const twitterImageUrl = "https://dstech.example.com/placeholder-twitter-connect-image.jpg";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [incomingRequests, setIncomingRequests] = useState<IncomingRequestUser[]>([]);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [errorIncoming, setErrorIncoming] = useState<string | null>(null);

  const [friendsList, setFriendsList] = useState<FriendUser[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [errorFriends, setErrorFriends] = useState<string | null>(null);

  // Fetch Friends List
  const fetchFriendsList = useCallback(async () => {
    setIsLoadingFriends(true);
    setErrorFriends(null);
    try {
      const response = await fetch('/api/friends/list');
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch friends list.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: FriendUser[] = await response.json();
        setFriendsList(data);
      } else {
        const textData = await response.text();
        throw new Error(`Server returned non-JSON response: ${textData.substring(0,100)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setErrorFriends(errorMessage);
      toast.error(`Failed to load friends: ${errorMessage}`);
    } finally {
      setIsLoadingFriends(false);
    }
  }, []);

  // Fetch Incoming Requests
  const fetchIncomingRequests = useCallback(async () => {
    setIsLoadingIncoming(true);
    setErrorIncoming(null);
    try {
      const response = await fetch('/api/friends/requests/incoming');
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch incoming requests.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: IncomingRequestUser[] = await response.json();
        setIncomingRequests(data);
      } else {
        const textData = await response.text();
        throw new Error(`Server returned non-JSON response: ${textData.substring(0,100)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setErrorIncoming(errorMessage);
      toast.error(`Error fetching incoming requests: ${errorMessage}`);
    } finally {
      setIsLoadingIncoming(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomingRequests();
    fetchFriendsList();
  }, [fetchIncomingRequests, fetchFriendsList]);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.length < 3) {
      toast.error("Search query must be at least 3 characters.");
      setSearchResults([]);
      setHasSearched(true);
      setError("Search query too short.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/users/search?username=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: SearchUser[] = await response.json();
        setSearchResults(data);
        if (data.length === 0) {
          toast.info("No users found matching your query.");
        }
      } else {
        const textData = await response.text();
        throw new Error(`Server returned non-JSON response: ${textData.substring(0,100)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during search.";
      setError(errorMessage);
      toast.error(`Search Error: ${errorMessage}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to send friend request.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      // Assuming success response might not always be JSON, or to be safe:
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Attempt to parse JSON if content type is correct, but be ready to catch errors if it's not.
        // For a simple success message, often there's no body or it's not critical to parse.
        // If a specific JSON body is expected on success, parse it here.
        // const successData = await response.json(); // Example if JSON expected
      } else if (response.body) { // Check if there's any body at all
        const textData = await response.text();
        if (textData) { // If there's text, and it wasn't JSON, it might be an unexpected success response format
          console.warn(`Received non-JSON success response: ${textData.substring(0,100)}`);
          // Potentially throw an error or handle as a non-critical warning
        }
      }

      toast.success("Friend request sent successfully!");
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === targetUserId ? { ...user, relationshipStatus: "request_sent" } : user
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Failed to send request: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const acceptFriendRequest = async (requesterUserId: string) => {
    setActionLoading(requesterUserId);
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterUserId }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to accept friend request.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      // Assuming success response might not always be JSON, or to be safe:
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // const successData = await response.json(); // Example if JSON expected
      } else if (response.body) {
        const textData = await response.text();
        if (textData) {
         console.warn(`Received non-JSON success response: ${textData.substring(0,100)}`);
        }
      }

      toast.success("Friend request accepted!");
      setIncomingRequests(prevRequests =>
        prevRequests.filter(request => request.id !== requesterUserId)
      );
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === requesterUserId ? { ...user, relationshipStatus: "friends" } : user
        )
      );
      fetchFriendsList(); // Refresh friends list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Failed to accept request: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const declineFriendRequest = async (requesterUserId: string) => {
    setActionLoading(requesterUserId);
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterUserId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to decline friend request.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      // Assuming success response might not always be JSON, or to be safe:
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // const successData = await response.json(); // Example if JSON expected
      } else if (response.body) {
        const textData = await response.text();
        if (textData) {
         console.warn(`Received non-JSON success response: ${textData.substring(0,100)}`);
        }
      }

      toast.success("Friend request declined.");
      setIncomingRequests(prevRequests =>
        prevRequests.filter(request => request.id !== requesterUserId)
      );
      // Optionally, update search results if the user was there with 'request_received'
      // This might be useful if the user is visible in search results and you want to reflect that the request is no longer pending.
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === requesterUserId && user.relationshipStatus === "request_received"
            ? { ...user, relationshipStatus: "none" } // Set to 'none' as the request is now void
            : user
        )
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Failed to decline request: ${errorMessage}`);
      // If the API call fails, the optimistic removal from incomingRequests might leave the UI inconsistent.
      // For now, we'll rely on the error toast. A more robust solution might re-fetch incoming requests or add the item back.
    } finally {
      setActionLoading(null);
    }
  };

  const removeFriend = async (friendUserId: string) => {
    setActionLoading(friendUserId);
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          throw new Error(errorData.error || "Failed to remove friend.");
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`);
        }
      }
      // Assuming success response might not always be JSON, or to be safe:
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // const successData = await response.json(); // Example if JSON expected
      } else if (response.body) {
        const textData = await response.text();
        if (textData) {
         console.warn(`Received non-JSON success response: ${textData.substring(0,100)}`);
        }
      }

      toast.success("Friend removed successfully.");
      setFriendsList(prevFriends =>
        prevFriends.filter(friend => friend.id !== friendUserId)
      );

      // Update search results if the removed friend is present there
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === friendUserId && user.relationshipStatus === "friends"
            ? { ...user, relationshipStatus: "none" } // Set to 'none' as they are no longer friends
            : user
        )
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Failed to remove friend: ${errorMessage}`);
      // Consider re-fetching friends list or adding friend back if API call failed after optimistic removal
    } finally {
      setActionLoading(null);
    }
  };

  const getRelationshipButton = (user: SearchUser) => {
    // ... (content of this function remains the same as previous version)
    const isButtonLoading = actionLoading === user.id;
    switch (user.relationshipStatus) {
      case "none":
        return (
          <Button variant="outline" size="sm" onClick={() => sendFriendRequest(user.id)} disabled={isButtonLoading}>
            {isButtonLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isButtonLoading ? "Sending..." : "Add Friend"}
          </Button>
        );
      case "request_sent":
        return (
          <Button variant="outline" size="sm" disabled>
            <Clock className="mr-2 h-4 w-4" /> Request Sent
          </Button>
        );
      case "request_received":
        return (
          <Button size="sm" onClick={() => acceptFriendRequest(user.id)} disabled={isButtonLoading}>
            {isButtonLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
            {isButtonLoading ? "Accepting..." : "Accept Request"}
          </Button>
        );
      case "friends":
        return (
          <Button variant="ghost" size="sm" disabled>
            <CheckCircle className="mr-2 h-4 w-4" /> Already Friends
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="dstech, connect, friends, network, collaboration, data science, search users, friend list" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="DStech" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={twitterImageUrl} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Connect & Collaborate</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Manage your network, find new connections, and view your friends.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Incoming Requests & Friends List */}
          <div className="lg:col-span-1 space-y-8">
            {/* Incoming Friend Requests Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Inbox className="mr-3 h-6 w-6 text-blue-500" /> Incoming Requests
                </CardTitle>
                <CardDescription>Review pending friend requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingIncoming && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading requests...</p>
                  </div>
                )}
                {!isLoadingIncoming && errorIncoming && (
                  <div className="text-red-500 dark:text-red-400 text-sm flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Error: {errorIncoming}
                  </div>
                )}
                {!isLoadingIncoming && !errorIncoming && incomingRequests.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">No new friend requests.</p>
                )}
                {!isLoadingIncoming && !errorIncoming && incomingRequests.length > 0 && (
                  <ul className="space-y-2.5">
                    {incomingRequests.map((request) => (
                      <li key={request.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{request.name || request.username}</p>
                          {request.ghUsername && <p className="text-xs text-gray-400 dark:text-gray-500">GH: {request.ghUsername}</p>}
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="xs" variant="outline" onClick={() => acceptFriendRequest(request.id)} disabled={actionLoading === request.id} className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-700/20 dark:hover:text-green-400">
                            {actionLoading === request.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            <UserCheck className="mr-1 h-3 w-3" /> Accept
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => declineFriendRequest(request.id)} disabled={actionLoading === request.id} className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-700/20 dark:hover:text-red-400">
                             {actionLoading === request.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            <UserX className="mr-1 h-3 w-3" /> Decline
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Your Friends Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-3 h-6 w-6 text-green-500" /> Your Friends
                </CardTitle>
                <CardDescription>View and manage your connections.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFriends && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading friends...</p>
                  </div>
                )}
                {!isLoadingFriends && errorFriends && (
                  <div className="text-red-500 dark:text-red-400 text-sm flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Error: {errorFriends}
                  </div>
                )}
                {!isLoadingFriends && !errorFriends && friendsList.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">You haven't added any friends yet. Use search to connect!</p>
                )}
                {!isLoadingFriends && !errorFriends && friendsList.length > 0 && (
                  <ul className="space-y-2.5">
                    {friendsList.map((friend) => (
                      <li key={friend.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{friend.name || friend.username}</p>
                          {friend.ghUsername && <p className="text-xs text-gray-400 dark:text-gray-500">GH: {friend.ghUsername}</p>}
                        </div>
                        <Button size="xs" variant="outline" onClick={() => removeFriend(friend.id)} disabled={actionLoading === friend.id} className="border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                          {actionLoading === friend.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          <UserMinus className="mr-1 h-3 w-3" /> Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: User Search & Results */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Link2 className="mr-3 h-6 w-6 text-purple-500" /> Find New Connections
                </CardTitle>
                <CardDescription>Search for users by their username (min. 3 characters).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setError(null); setHasSearched(false); }}
                    placeholder="Search by username..."
                    className="flex-grow"
                    aria-label="Search username"
                  />
                  <Button type="submit" disabled={isLoading || actionLoading !== null}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search Results Display */}
            {isLoading && (
              <div className="text-center py-6">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="mt-3 text-gray-600 dark:text-gray-300">Searching for users...</p>
              </div>
            )}
            {!isLoading && error && (
              <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                    <AlertTriangle className="mr-2 h-5 w-5" /> Search Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                  {searchQuery.length < 3 && error.includes("too short") && (
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please enter at least 3 characters.</p>
                  )}
                </CardContent>
              </Card>
            )}
            {!isLoading && !error && hasSearched && searchResults.length === 0 && (
               <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">No Users Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No users matched your search for "{searchQuery}".</p>
              </div>
            )}
            {!isLoading && !error && searchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className="shadow-md hover:shadow-lg transition-shadow duration-150">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      {user.ghUsername && <CardDescription className="text-xs">GH: {user.ghUsername}</CardDescription>}
                    </CardHeader>
                    <CardFooter>
                      {getRelationshipButton(user)}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
